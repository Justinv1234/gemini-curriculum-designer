"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import type { ChangeItem } from "@/lib/types/curriculum";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  generating: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  generated: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface ChangeReviewCardProps {
  change: ChangeItem;
  streamedContent?: string;
  isStreaming?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ChangeReviewCard({
  change,
  streamedContent,
  isStreaming,
  onApprove,
  onReject,
}: ChangeReviewCardProps) {
  const showContent = isStreaming ? streamedContent : change.after;

  return (
    <Card className="mb-4">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">{change.title}</h4>
          <Badge
            variant="secondary"
            className={statusColors[change.status] ?? ""}
          >
            {change.status === "generating" ? "Generating..." : change.status}
          </Badge>
        </div>

        {change.before && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Before
            </p>
            <div className="rounded border bg-red-50 p-3 text-sm dark:bg-red-950">
              {change.before}
            </div>
          </div>
        )}

        {showContent && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {change.before ? "After" : "New Content"}
            </p>
            <div className="rounded border bg-green-50 p-3 dark:bg-green-950">
              <MarkdownRenderer content={showContent} />
            </div>
          </div>
        )}

        {change.status === "generating" && isStreaming && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="animate-pulse">&#x25CF;</span>
            Generating update...
          </div>
        )}

        {change.status === "generated" && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(change.id)}
            >
              Reject
            </Button>
            <Button size="sm" onClick={() => onApprove(change.id)}>
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
