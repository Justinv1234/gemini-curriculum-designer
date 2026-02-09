"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisReport } from "@/lib/types/curriculum";

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

interface AnalysisReportViewProps {
  report: AnalysisReport;
}

export function AnalysisReportView({ report }: AnalysisReportViewProps) {
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
            <p className="text-2xl font-bold">{report.gaps.length}</p>
            <p className="text-xs text-muted-foreground">Gaps Found</p>
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
          <h3 className="text-lg font-semibold mb-3">Strengths</h3>
          <div className="space-y-2">
            {report.strengths.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950"
              >
                <span className="shrink-0 mt-0.5">&#x2705;</span>
                <p className="text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {report.gaps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Gaps & Opportunities</h3>
          <div className="space-y-2">
            {report.gaps.map((gap) => (
              <div
                key={gap.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Badge
                  variant="secondary"
                  className={gapTypeColors[gap.type] ?? ""}
                >
                  {gap.type}
                </Badge>
                <p className="text-sm">{gap.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
