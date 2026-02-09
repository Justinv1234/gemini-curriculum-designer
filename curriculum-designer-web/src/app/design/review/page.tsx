"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableTab } from "@/components/shared/EditableTab";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

export default function ReviewPage() {
  const router = useRouter();
  const store = useCurriculumStore();
  const {
    courseInfo,
    topicLandscape,
    modules,
    assessmentsContent,
    deliveryContent,
    setTopicLandscape,
    setAssessmentsContent,
    setDeliveryContent,
  } = store;

  if (!courseInfo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No curriculum data found.</p>
        <Button onClick={() => router.push("/design/phase-1")}>Start from Phase 1</Button>
      </div>
    );
  }

  const curriculumContent = modules
    .filter((m) => m.content)
    .map((m) => m.content)
    .join("\n\n---\n\n");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Review & Export</h1>
          <p className="text-muted-foreground">
            Review all generated content and export your curriculum.
          </p>
        </div>
        <ExportButtons />
      </div>

      <div className="mb-6 rounded-lg border bg-muted/30 p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-muted-foreground">Topic</p>
            <p className="font-medium">{courseInfo.topic}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Audience</p>
            <p className="font-medium capitalize">{courseInfo.audience}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Format</p>
            <p className="font-medium capitalize">{courseInfo.format}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Modules</p>
            <p className="font-medium">
              {modules.filter((m) => m.status === "complete").length} / {modules.length}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="curriculum" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum">
          <EditableTab
            content={curriculumContent}
            onSave={(content) => {
              // Re-save to first module for simplicity
              // In a more complex implementation, you'd split back into modules
            }}
            label="Curriculum"
          />
        </TabsContent>

        <TabsContent value="assessments">
          <EditableTab
            content={assessmentsContent ?? ""}
            onSave={setAssessmentsContent}
            label="Assessments"
          />
        </TabsContent>

        <TabsContent value="delivery">
          <EditableTab
            content={deliveryContent ?? ""}
            onSave={setDeliveryContent}
            label="Delivery"
          />
        </TabsContent>

        <TabsContent value="resources">
          <EditableTab
            content={topicLandscape ?? ""}
            onSave={setTopicLandscape}
            label="Resources"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
