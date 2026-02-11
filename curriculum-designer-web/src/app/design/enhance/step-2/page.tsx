"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StreamingText } from "@/components/shared/StreamingText";
import { WhatsNewCardList } from "@/components/enhance/WhatsNewCardList";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { parseWhatsNewJSON, stripJSONBlocks } from "@/lib/parsers";

export default function EnhanceStep2Page() {
  const router = useRouter();
  const {
    analysisReportStructured,
    whatsNewContent,
    whatsNewItems,
    setWhatsNewContent,
    setWhatsNewItems,
    setEnhancePhase,
  } = useCurriculumStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState(
    whatsNewContent ?? ""
  );

  const handleResearch = useCallback(async () => {
    if (!analysisReportStructured) return;

    setIsStreaming(true);
    setStreamedContent("");

    try {
      const response = await fetch("/api/enhance/whats-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisReport: analysisReportStructured }),
      });

      if (!response.ok) throw new Error("Research failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setStreamedContent(fullContent);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Parse structured items from the response
      const items = parseWhatsNewJSON(fullContent);
      const cleanContent = stripJSONBlocks(fullContent);

      setWhatsNewContent(cleanContent);
      if (items) {
        setWhatsNewItems(items);
      }
    } catch (error) {
      console.error("What's New error:", error);
    } finally {
      setIsStreaming(false);
    }
  }, [analysisReportStructured, setWhatsNewContent, setWhatsNewItems]);

  const handleContinue = () => {
    setEnhancePhase(2);
    router.push("/design/enhance/step-3");
  };

  if (!analysisReportStructured) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">
          Please complete the analysis step first.
        </p>
        <Button onClick={() => router.push("/design/enhance/step-1")}>
          Go to Step 1
        </Button>
      </div>
    );
  }

  const hasContent = streamedContent || whatsNewContent;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Step 2: What&apos;s New</h1>
      <p className="text-muted-foreground mb-8">
        Research recent developments relevant to your curriculum.
      </p>

      {/* Analysis summary */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <p className="text-muted-foreground">Course</p>
              <p className="font-medium">{analysisReportStructured.courseName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Modules</p>
              <p className="font-medium">{analysisReportStructured.moduleCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gaps Found</p>
              <p className="font-medium">{analysisReportStructured.gaps.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Depth</p>
              <p className="font-medium capitalize">{analysisReportStructured.depth}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleResearch}
        disabled={isStreaming}
        size="lg"
      >
        {isStreaming ? "Researching..." : whatsNewContent ? "Re-research" : "Research Updates"}
      </Button>

      {/* Show streaming content while streaming */}
      {isStreaming && streamedContent && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Researching...</h2>
          <div className="rounded-lg border p-6 bg-card">
            <StreamingText content={streamedContent} isStreaming={true} />
          </div>
        </div>
      )}

      {/* After streaming: show cards if parsed, fallback to raw */}
      {!isStreaming && hasContent && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Developments</h2>

          {whatsNewItems && whatsNewItems.length > 0 ? (
            <WhatsNewCardList items={whatsNewItems} />
          ) : (
            <div className="rounded-lg border p-6 bg-card">
              <StreamingText
                content={whatsNewContent || ""}
                isStreaming={false}
              />
            </div>
          )}

          {whatsNewContent && (
            <div className="mt-6">
              <Button onClick={handleContinue} size="lg">
                Continue to Enhancements
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
