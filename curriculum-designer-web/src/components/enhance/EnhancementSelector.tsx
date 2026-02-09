"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

const categoryLabels: Record<string, string> = {
  "update-outdated": "Update Outdated",
  "add-modules": "Add Modules",
  "refresh-examples": "Refresh Examples",
  "add-delivery": "Add Delivery",
  "enhance-assessments": "Enhance Assessments",
  "add-interactive": "Add Interactive",
};

const impactColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function EnhancementSelector() {
  const proposals = useCurriculumStore((s) => s.enhancementProposals);
  const toggleSelection = useCurriculumStore((s) => s.toggleProposalSelection);

  const selectedCount = proposals.filter((p) => p.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedCount} of {proposals.length} selected
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {proposals.map((proposal) => (
          <Card
            key={proposal.id}
            className={cn(
              "cursor-pointer transition-all border-2",
              proposal.selected
                ? "border-primary bg-primary/5"
                : "border-transparent hover:border-muted-foreground/20"
            )}
            onClick={() => toggleSelection(proposal.id)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {proposal.selected ? "\u2611\uFE0F" : "\u2B1C"}
                  </span>
                  <h4 className="font-medium text-sm">{proposal.title}</h4>
                </div>
                <Badge
                  variant="secondary"
                  className={impactColors[proposal.impact] ?? ""}
                >
                  {proposal.impact}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {proposal.description}
              </p>
              <Badge variant="outline" className="text-xs">
                {categoryLabels[proposal.category] ?? proposal.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
