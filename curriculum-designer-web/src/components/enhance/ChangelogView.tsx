"use client";

import { Badge } from "@/components/ui/badge";
import type { ChangelogEntry } from "@/lib/types/curriculum";

const categoryLabels: Record<string, string> = {
  "update-outdated": "Updated",
  "add-modules": "Added Module",
  "refresh-examples": "Refreshed Examples",
  "add-delivery": "Added Delivery",
  "enhance-assessments": "Enhanced Assessments",
  "add-interactive": "Added Interactive",
};

interface ChangelogViewProps {
  entries: ChangelogEntry[];
}

export function ChangelogView({ entries }: ChangelogViewProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No changes applied yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Changelog</h3>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 rounded-lg border p-3"
        >
          <Badge variant="outline" className="shrink-0 text-xs">
            {categoryLabels[entry.category] ?? entry.category}
          </Badge>
          <div className="flex-1">
            <p className="text-sm">{entry.description}</p>
            <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
