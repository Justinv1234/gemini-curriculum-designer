"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EnhancementSelector } from "@/components/enhance/EnhancementSelector";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { generateId } from "@/lib/parsers";
import type { EnhancementProposal } from "@/lib/types/curriculum";

export default function EnhanceStep3Page() {
  const router = useRouter();
  const {
    analysisReportStructured,
    whatsNewContent,
    whatsNewItems,
    enhancementProposals,
    setEnhancementProposals,
    setEnhancePhase,
  } = useCurriculumStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateProposals = useCallback(async () => {
    if (!analysisReportStructured || !whatsNewContent) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/enhance/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisReport: analysisReportStructured,
          whatsNewContent,
          whatsNewItems,
        }),
      });

      if (!response.ok) throw new Error("Proposal generation failed");

      const data = await response.json();
      const proposals: EnhancementProposal[] = (
        data.proposals as Array<Omit<EnhancementProposal, "id" | "selected">>
      ).map((p) => ({
        ...p,
        id: generateId(),
        selected: p.impact === "high", // Pre-select high-impact proposals
      }));

      setEnhancementProposals(proposals);
    } catch (error) {
      console.error("Proposal error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [analysisReportStructured, whatsNewContent, whatsNewItems, setEnhancementProposals]);

  const handleContinue = () => {
    setEnhancePhase(3);
    router.push("/design/enhance/step-4");
  };

  if (!analysisReportStructured || !whatsNewContent) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">
          Please complete the previous steps first.
        </p>
        <Button onClick={() => router.push("/design/enhance/step-1")}>
          Go to Step 1
        </Button>
      </div>
    );
  }

  const selectedCount = enhancementProposals.filter((p) => p.selected).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Step 3: Enhancement Proposals</h1>
      <p className="text-muted-foreground mb-8">
        Review and select the improvements to apply to your curriculum.
      </p>

      {enhancementProposals.length === 0 ? (
        <Button
          onClick={handleGenerateProposals}
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? "Generating Proposals..." : "Generate Proposals"}
        </Button>
      ) : (
        <>
          <EnhancementSelector />

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleGenerateProposals}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Regenerating..." : "Regenerate"}
            </Button>
            <Button
              onClick={handleContinue}
              disabled={selectedCount === 0}
              size="lg"
            >
              Apply {selectedCount} Selected Enhancement{selectedCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
