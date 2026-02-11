"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableTab } from "@/components/shared/EditableTab";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { ChangelogView } from "@/components/enhance/ChangelogView";
import { AnalysisReportView } from "@/components/enhance/AnalysisReportView";
import { WhatsNewCardList } from "@/components/enhance/WhatsNewCardList";
import { ChangeReviewCard } from "@/components/enhance/ChangeReviewCard";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

export default function EnhanceReviewPage() {
  const router = useRouter();
  const store = useCurriculumStore();
  const {
    analysisReportRaw,
    analysisReportStructured,
    whatsNewContent,
    whatsNewItems,
    changes,
    changelog,
    setAnalysisReportRaw,
    setWhatsNewContent,
  } = store;

  const [showRawAnalysis, setShowRawAnalysis] = useState(false);
  const [showRawWhatsNew, setShowRawWhatsNew] = useState(false);
  const [showRawChanges, setShowRawChanges] = useState(false);

  if (!analysisReportStructured) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No enhancement data found.</p>
        <Button onClick={() => router.push("/design/enhance/step-1")}>
          Start from Step 1
        </Button>
      </div>
    );
  }

  const approvedChanges = changes.filter((c) => c.status === "approved");
  const changesContent = approvedChanges
    .map((c) => `## ${c.title}\n\n${c.after}`)
    .join("\n\n---\n\n");

  const selectedWhatsNew = whatsNewItems?.filter((i) => i.selected) ?? [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Review & Export</h1>
          <p className="text-muted-foreground">
            Review all enhancement results and export your updated curriculum.
          </p>
        </div>
        <ExportButtons />
      </div>

      <div className="mb-6 rounded-lg border bg-muted/30 p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-muted-foreground">Course</p>
            <p className="font-medium">{analysisReportStructured.courseName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Changes Applied</p>
            <p className="font-medium">{approvedChanges.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rejected</p>
            <p className="font-medium">
              {changes.filter((c) => c.status === "rejected").length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Modules</p>
            <p className="font-medium">{analysisReportStructured.moduleCount}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="whats-new">What&apos;s New</TabsTrigger>
          <TabsTrigger value="changes">Changes</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <div className="flex justify-end mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawAnalysis(!showRawAnalysis)}
            >
              {showRawAnalysis ? "Structured View" : "Edit Raw"}
            </Button>
          </div>
          {showRawAnalysis ? (
            <EditableTab
              content={analysisReportRaw ?? ""}
              onSave={setAnalysisReportRaw}
              label="Analysis"
            />
          ) : (
            <AnalysisReportView report={analysisReportStructured} readOnly />
          )}
        </TabsContent>

        {/* What's New Tab */}
        <TabsContent value="whats-new">
          <div className="flex justify-end mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawWhatsNew(!showRawWhatsNew)}
            >
              {showRawWhatsNew ? "Structured View" : "Edit Raw"}
            </Button>
          </div>
          {showRawWhatsNew ? (
            <EditableTab
              content={whatsNewContent ?? ""}
              onSave={setWhatsNewContent}
              label="What's New"
            />
          ) : selectedWhatsNew.length > 0 ? (
            <WhatsNewCardList items={selectedWhatsNew} readOnly />
          ) : (
            <EditableTab
              content={whatsNewContent ?? ""}
              onSave={setWhatsNewContent}
              label="What's New"
            />
          )}
        </TabsContent>

        {/* Changes Tab */}
        <TabsContent value="changes">
          <div className="flex justify-end mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawChanges(!showRawChanges)}
            >
              {showRawChanges ? "Card View" : "Edit Raw"}
            </Button>
          </div>
          {showRawChanges ? (
            changesContent ? (
              <EditableTab
                content={changesContent}
                onSave={() => {}}
                label="Changes"
              />
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                No approved changes yet.
              </div>
            )
          ) : approvedChanges.length > 0 ? (
            <div className="space-y-4">
              {approvedChanges.map((change) => (
                <ChangeReviewCard
                  key={change.id}
                  change={change}
                  onApprove={() => {}}
                  onReject={() => {}}
                  readOnly
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              No approved changes yet.
            </div>
          )}
        </TabsContent>

        {/* Changelog Tab */}
        <TabsContent value="changelog">
          <div className="rounded-lg border p-6 bg-card">
            <ChangelogView entries={changelog} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
