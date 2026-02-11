"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChangeReviewCard } from "@/components/enhance/ChangeReviewCard";
import { ChangelogView } from "@/components/enhance/ChangelogView";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { parseChangeJSON, stripJSONBlocks, generateId } from "@/lib/parsers";
import type { ChangeItem } from "@/lib/types/curriculum";

export default function EnhanceStep4Page() {
  const router = useRouter();
  const {
    analysisReportStructured,
    whatsNewContent,
    enhancementProposals,
    changes,
    changelog,
    setChanges,
    updateChange,
    setChangeFeedback,
    addChangelogEntry,
    setEnhancePhase,
  } = useCurriculumStore();

  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [streamedContent, setStreamedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const autoTriggered = useRef(false);

  const selectedProposals = enhancementProposals.filter((p) => p.selected);

  const handleGenerateAll = useCallback(async () => {
    if (!analysisReportStructured || !whatsNewContent) return;

    setIsGenerating(true);

    // Create initial change items for selected proposals
    const initialChanges: ChangeItem[] = selectedProposals.map((p) => ({
      id: generateId(),
      enhancementId: p.id,
      title: p.title,
      after: "",
      status: "pending",
    }));
    setChanges(initialChanges);

    // Process each proposal sequentially
    for (const change of initialChanges) {
      const proposal = selectedProposals.find(
        (p) => p.id === change.enhancementId
      );
      if (!proposal) continue;

      // Mark as generating
      updateChange(change.id, { status: "generating" });
      setActiveStreamId(change.id);
      setStreamedContent("");

      try {
        const response = await fetch("/api/enhance/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposal,
            analysisReport: analysisReportStructured,
            whatsNewContent,
          }),
        });

        if (!response.ok) throw new Error("Update generation failed");

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

        // Parse the change JSON block
        const changeData = parseChangeJSON(fullContent, proposal.id);
        const cleanContent = stripJSONBlocks(fullContent);

        updateChange(change.id, {
          after: cleanContent,
          before: changeData?.before ?? undefined,
          status: "generated",
        });
      } catch (error) {
        console.error("Update generation error:", error);
        updateChange(change.id, { status: "generated", after: "Error generating update." });
      }
    }

    setActiveStreamId(null);
    setStreamedContent("");
    setIsGenerating(false);
  }, [
    analysisReportStructured,
    whatsNewContent,
    selectedProposals,
    setChanges,
    updateChange,
  ]);

  // Auto-trigger generation on mount
  useEffect(() => {
    if (
      !autoTriggered.current &&
      changes.length === 0 &&
      selectedProposals.length > 0 &&
      analysisReportStructured &&
      whatsNewContent
    ) {
      autoTriggered.current = true;
      handleGenerateAll();
    }
  }, [changes.length, selectedProposals.length, analysisReportStructured, whatsNewContent, handleGenerateAll]);

  const handleRegenerate = useCallback(
    async (id: string, feedback: string) => {
      if (!analysisReportStructured || !whatsNewContent) return;
      if (isGenerating) return;

      const change = changes.find((c) => c.id === id);
      if (!change) return;

      const proposal = enhancementProposals.find(
        (p) => p.id === change.enhancementId
      );
      if (!proposal) return;

      // Save the feedback
      if (feedback.trim()) {
        setChangeFeedback(id, feedback);
      }

      // Mark as generating
      updateChange(id, { status: "generating" });
      setActiveStreamId(id);
      setStreamedContent("");
      setIsGenerating(true);

      try {
        const response = await fetch("/api/enhance/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposal,
            analysisReport: analysisReportStructured,
            whatsNewContent,
            feedback: feedback.trim() || undefined,
          }),
        });

        if (!response.ok) throw new Error("Regeneration failed");

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

        const changeData = parseChangeJSON(fullContent, proposal.id);
        const cleanContent = stripJSONBlocks(fullContent);

        updateChange(id, {
          after: cleanContent,
          before: changeData?.before ?? undefined,
          status: "generated",
          feedback: feedback.trim() || undefined,
        });
      } catch (error) {
        console.error("Regeneration error:", error);
        updateChange(id, { status: "generated", after: "Error regenerating update." });
      }

      setActiveStreamId(null);
      setStreamedContent("");
      setIsGenerating(false);
    },
    [analysisReportStructured, whatsNewContent, changes, enhancementProposals, isGenerating, updateChange, setChangeFeedback]
  );

  const handleApprove = useCallback(
    (id: string) => {
      const change = changes.find((c) => c.id === id);
      if (!change) return;

      updateChange(id, { status: "approved" });

      const proposal = enhancementProposals.find(
        (p) => p.id === change.enhancementId
      );
      addChangelogEntry({
        id: generateId(),
        date: new Date().toLocaleDateString(),
        category: proposal?.category ?? "update-outdated",
        description: `Approved: ${change.title}`,
      });
    },
    [changes, enhancementProposals, updateChange, addChangelogEntry]
  );

  const handleReject = useCallback(
    (id: string) => {
      updateChange(id, { status: "rejected" });
    },
    [updateChange]
  );

  const handleContinue = () => {
    setEnhancePhase(4);
    router.push("/design/enhance/review");
  };

  if (!analysisReportStructured || selectedProposals.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">
          Please select enhancements in the previous step first.
        </p>
        <Button onClick={() => router.push("/design/enhance/step-3")}>
          Go to Step 3
        </Button>
      </div>
    );
  }

  const allProcessed =
    changes.length > 0 &&
    changes.every((c) => c.status !== "pending" && c.status !== "generating");
  const hasApproved = changes.some((c) => c.status === "approved");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Step 4: Apply Changes</h1>
      <p className="text-muted-foreground mb-8">
        Review each generated change — approve, reject, or regenerate with feedback.
      </p>

      {changes.length > 0 ? (
        <div className="space-y-4">
          {changes.map((change) => (
            <ChangeReviewCard
              key={change.id}
              change={change}
              streamedContent={
                activeStreamId === change.id ? streamedContent : undefined
              }
              isStreaming={activeStreamId === change.id}
              onApprove={handleApprove}
              onReject={handleReject}
              onRegenerate={handleRegenerate}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="animate-pulse">&#x25CF;</span>
          Starting generation...
        </div>
      )}

      {changelog.length > 0 && (
        <div className="mt-8">
          <ChangelogView entries={changelog} />
        </div>
      )}

      {allProcessed && (
        <div className="mt-6 flex gap-3">
          {!isGenerating && changes.length > 0 && (
            <Button
              variant="outline"
              onClick={handleGenerateAll}
            >
              Regenerate All
            </Button>
          )}
          <Button
            onClick={handleContinue}
            disabled={!hasApproved}
            size="lg"
          >
            Continue to Review
          </Button>
        </div>
      )}
    </div>
  );
}
