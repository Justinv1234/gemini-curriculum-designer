"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableTab } from "@/components/shared/EditableTab";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { ChangelogView } from "@/components/enhance/ChangelogView";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

export default function EnhanceReviewPage() {
  const router = useRouter();
  const store = useCurriculumStore();
  const {
    analysisReportRaw,
    analysisReportStructured,
    whatsNewContent,
    changes,
    changelog,
    setAnalysisReportRaw,
    setWhatsNewContent,
  } = store;

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

        <TabsContent value="analysis">
          <EditableTab
            content={analysisReportRaw ?? ""}
            onSave={setAnalysisReportRaw}
            label="Analysis"
          />
        </TabsContent>

        <TabsContent value="whats-new">
          <EditableTab
            content={whatsNewContent ?? ""}
            onSave={setWhatsNewContent}
            label="What's New"
          />
        </TabsContent>

        <TabsContent value="changes">
          {changesContent ? (
            <EditableTab
              content={changesContent}
              onSave={() => {
                // Changes are individually managed; editing the combined view
                // is display-only in this context
              }}
              label="Changes"
            />
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              No approved changes yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="changelog">
          <div className="rounded-lg border p-6 bg-card">
            <ChangelogView entries={changelog} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
