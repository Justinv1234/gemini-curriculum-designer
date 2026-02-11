"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import type { WhatsNewItem, WhatsNewCategory } from "@/lib/types/curriculum";

const categoryLabels: Record<WhatsNewCategory, string> = {
  "recent-developments": "Recent",
  "industry-trends": "Trends",
  "updated-resources": "Resources",
  "pedagogical-updates": "Pedagogy",
};

const categoryColors: Record<WhatsNewCategory, string> = {
  "recent-developments":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "industry-trends":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "updated-resources":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "pedagogical-updates":
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

interface WhatsNewCardListProps {
  items: WhatsNewItem[];
  readOnly?: boolean;
}

export function WhatsNewCardList({ items, readOnly }: WhatsNewCardListProps) {
  const { toggleWhatsNewItemSelection, toggleWhatsNewItemExpanded } =
    useCurriculumStore();

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div className="space-y-4">
      {!readOnly && (
        <p className="text-sm text-muted-foreground">
          {selectedCount} of {items.length} selected for enhancement proposals
        </p>
      )}

      {items.map((item) => {
        const isExpanded = readOnly || item.expanded;

        return (
          <Card
            key={item.id}
            className={`transition-opacity ${
              !readOnly && !item.selected ? "opacity-50" : ""
            }`}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                {!readOnly && (
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleWhatsNewItemSelection(item.id)}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={categoryColors[item.category] ?? ""}
                    >
                      {categoryLabels[item.category] ?? item.category}
                    </Badge>
                    <h4
                      className={`font-semibold text-sm ${!readOnly ? "cursor-pointer hover:text-primary" : ""}`}
                      onClick={() =>
                        !readOnly && toggleWhatsNewItemExpanded(item.id)
                      }
                    >
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.summary}</p>

                  {isExpanded && item.details && (
                    <div className="mt-3 rounded border bg-muted/30 p-3">
                      <MarkdownRenderer content={item.details} />
                    </div>
                  )}

                  {!readOnly && !isExpanded && item.details && (
                    <button
                      onClick={() => toggleWhatsNewItemExpanded(item.id)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      Show details
                    </button>
                  )}

                  {!readOnly && isExpanded && item.details && (
                    <button
                      onClick={() => toggleWhatsNewItemExpanded(item.id)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      Hide details
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
