"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/enhance/FileUpload";
import { AnalysisReportView } from "@/components/enhance/AnalysisReportView";
import { StreamingText } from "@/components/shared/StreamingText";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import {
  parseAnalysisReportJSON,
  stripJSONBlocks,
} from "@/lib/parsers";

export default function EnhanceStep1Page() {
  const router = useRouter();
  const {
    uploadedFiles,
    analysisReportRaw,
    analysisReportStructured,
    setAnalysisReportRaw,
    setAnalysisReportStructured,
    setEnhancePhase,
  } = useCurriculumStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState(
    analysisReportRaw ?? ""
  );

  const handleAnalyze = useCallback(async () => {
    if (uploadedFiles.length === 0) return;

    setIsStreaming(true);
    setStreamedContent("");
    setAnalysisReportStructured(null);

    try {
      const response = await fetch("/api/enhance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: uploadedFiles }),
      });

      if (!response.ok) throw new Error("Analysis failed");

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

      // Parse structured data
      const reportData = parseAnalysisReportJSON(fullContent);
      const cleanContent = stripJSONBlocks(fullContent);

      setAnalysisReportRaw(cleanContent);
      setStreamedContent(cleanContent);

      if (reportData) {
        setAnalysisReportStructured(reportData);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsStreaming(false);
    }
  }, [
    uploadedFiles,
    setAnalysisReportRaw,
    setAnalysisReportStructured,
  ]);

  const handleContinue = () => {
    setEnhancePhase(1);
    router.push("/design/enhance/step-2");
  };

  const hasContent = streamedContent || analysisReportRaw;
  const showStructuredReport = !isStreaming && analysisReportStructured;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Step 1: Analyze Materials</h1>
      <p className="text-muted-foreground mb-8">
        Upload your existing curriculum files for AI-powered analysis.
      </p>

      <FileUpload />

      <div className="mt-6">
        <Button
          onClick={handleAnalyze}
          disabled={uploadedFiles.length === 0 || isStreaming}
          size="lg"
        >
          {isStreaming ? "Analyzing..." : "Analyze Materials"}
        </Button>
      </div>

      {hasContent && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Analysis Report</h2>

          {showStructuredReport ? (
            <AnalysisReportView report={analysisReportStructured} />
          ) : (
            <div className="rounded-lg border p-6 bg-card">
              <StreamingText
                content={streamedContent || analysisReportRaw || ""}
                isStreaming={isStreaming}
              />
            </div>
          )}

          {!isStreaming && analysisReportStructured && (
            <div className="mt-6">
              <Button onClick={handleContinue} size="lg">
                Continue to What&apos;s New
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
