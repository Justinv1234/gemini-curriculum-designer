"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import type { AnalysisReport, GapAction, StrengthAction } from "@/lib/types/curriculum";

const statusColors: Record<string, string> = {
  current: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "needs-update": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  outdated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const gapTypeColors: Record<string, string> = {
  missing: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  outdated: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  opportunity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const gapActionColors: Record<GapAction, string> = {
  include: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  defer: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  skip: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const strengthActionColors: Record<StrengthAction, string> = {
  keep: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "de-emphasize": "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const GAP_ACTION_CYCLE: GapAction[] = ["include", "defer", "skip"];

interface AnalysisReportViewProps {
  report: AnalysisReport;
  readOnly?: boolean;
}

export function AnalysisReportView({ report, readOnly }: AnalysisReportViewProps) {
  const { updateGapAction, updateStrengthAction, addCustomGap } =
    useCurriculumStore();
  const [newGapText, setNewGapText] = useState("");
  const [newGapType, setNewGapType] = useState<"missing" | "outdated" | "opportunity">("opportunity");

  const cycleGapAction = (id: string, current: GapAction) => {
    if (readOnly) return;
    const idx = GAP_ACTION_CYCLE.indexOf(current);
    const next = GAP_ACTION_CYCLE[(idx + 1) % GAP_ACTION_CYCLE.length];
    updateGapAction(id, next);
  };

  const toggleStrength = (id: string, current: StrengthAction) => {
    if (readOnly) return;
    updateStrengthAction(id, current === "keep" ? "de-emphasize" : "keep");
  };

  const handleAddGap = () => {
    const trimmed = newGapText.trim();
    if (!trimmed) return;
    addCustomGap(trimmed, newGapType);
    setNewGapText("");
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">{report.moduleCount}</p>
            <p className="text-xs text-muted-foreground">Modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold capitalize">{report.depth}</p>
            <p className="text-xs text-muted-foreground">Depth</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold capitalize">{report.format}</p>
            <p className="text-xs text-muted-foreground">Format</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">
              {report.gaps.filter((g) => g.action !== "skip").length}
            </p>
            <p className="text-xs text-muted-foreground">Active Gaps</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Inventory */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Content Inventory</h3>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Module</th>
                <th className="px-4 py-2 text-left font-medium">Topics</th>
                <th className="px-4 py-2 text-left font-medium">Recency</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.contentInventory.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2 font-medium">{item.moduleName}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {item.topicsCovered.join(", ")}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {item.estimatedRecency}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status] ?? ""}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strengths */}
      {report.strengths.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Strengths</h3>
          {!readOnly && (
            <p className="text-sm text-muted-foreground mb-3">
              Click the badge to toggle between keep and de-emphasize.
            </p>
          )}
          <div className="space-y-2">
            {report.strengths.map((s) => (
              <div
                key={s.id}
                className={`flex items-start gap-2 rounded-lg border p-3 transition-opacity ${
                  s.action === "de-emphasize"
                    ? "border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-900"
                    : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {s.action === "keep" ? "\u2705" : "\u2B07\uFE0F"}
                </span>
                <p className="text-sm flex-1">{s.description}</p>
                {!readOnly && (
                  <button
                    onClick={() => toggleStrength(s.id, s.action)}
                    title={`Status: ${s.action}. Click to toggle.`}
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors hover:ring-2 hover:ring-primary/30 ${strengthActionColors[s.action]}`}
                  >
                    {s.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {report.gaps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Gaps & Opportunities</h3>
          {!readOnly && (
            <p className="text-sm text-muted-foreground mb-3">
              Click the action badge to cycle: include (address now) &rarr; defer (lower priority) &rarr; skip (ignore).
            </p>
          )}
          <div className="space-y-2">
            {report.gaps.map((gap) => (
              <div
                key={gap.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-opacity ${
                  gap.action === "skip" ? "opacity-40" : ""
                }`}
              >
                <Badge
                  variant="secondary"
                  className={gapTypeColors[gap.type] ?? ""}
                >
                  {gap.type}
                </Badge>
                <p className="text-sm flex-1">{gap.description}</p>
                {!readOnly && (
                  <button
                    onClick={() => cycleGapAction(gap.id, gap.action)}
                    title={`Action: ${gap.action}. Click to cycle.`}
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors hover:ring-2 hover:ring-primary/30 ${gapActionColors[gap.action]}`}
                  >
                    {gap.action}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add custom gap */}
          {!readOnly && (
            <div className="mt-4 flex gap-2">
              <select
                value={newGapType}
                onChange={(e) =>
                  setNewGapType(e.target.value as typeof newGapType)
                }
                className="rounded-md border px-2 py-1.5 text-sm bg-background"
              >
                <option value="opportunity">opportunity</option>
                <option value="missing">missing</option>
                <option value="outdated">outdated</option>
              </select>
              <input
                type="text"
                value={newGapText}
                onChange={(e) => setNewGapText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGap()}
                placeholder="Add a custom gap..."
                className="flex-1 rounded-md border px-3 py-1.5 text-sm bg-background"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddGap}
                disabled={!newGapText.trim()}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
