"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PrerequisitesStep } from "./PrerequisitesStep";
import { ConceptsStep } from "./ConceptsStep";
import { LessonsStep } from "./LessonsStep";
import { StreamingText } from "@/components/shared/StreamingText";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { useStreaming } from "@/lib/hooks/useStreaming";
import { generateId } from "@/lib/parsers";
import { cn } from "@/lib/utils";
import type {
  Prerequisite,
  CoreConcept,
  LessonPlanItem,
  ActivityItem,
  ModuleStatus,
} from "@/lib/types/curriculum";

interface ModuleInterviewProps {
  moduleIndex: number;
}

const INTERVIEW_STEPS = [
  { key: "prereqs", label: "Prerequisites" },
  { key: "concepts", label: "Concepts" },
  { key: "lessons", label: "Lessons" },
  { key: "generate", label: "Generate" },
] as const;

function getStepIndex(status: ModuleStatus): number {
  switch (status) {
    case "pending":
    case "interviewing-prereqs":
      return 0;
    case "prereqs-confirmed":
    case "interviewing-concepts":
      return 1;
    case "concepts-confirmed":
    case "interviewing-lessons":
      return 2;
    case "lessons-approved":
    case "generating":
    case "complete":
      return 3;
    default:
      return 0;
  }
}

export function ModuleInterview({ moduleIndex }: ModuleInterviewProps) {
  const { courseInfo, modules, updateModule } = useCurriculumStore();
  const module = modules[moduleIndex];
  const generation = useStreaming();

  const [prereqs, setPrereqs] = useState<Prerequisite[]>(
    module.prerequisites ?? []
  );
  const [concepts, setConcepts] = useState<CoreConcept[]>(
    module.coreConcepts ?? []
  );
  const [lessons, setLessons] = useState<LessonPlanItem[]>(
    module.lessonPlan?.lessons ?? []
  );
  const [activities, setActivities] = useState<ActivityItem[]>(
    module.lessonPlan?.activities ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state when moduleIndex changes
  useEffect(() => {
    const m = modules[moduleIndex];
    setPrereqs(m.prerequisites ?? []);
    setConcepts(m.coreConcepts ?? []);
    setLessons(m.lessonPlan?.lessons ?? []);
    setActivities(m.lessonPlan?.activities ?? []);
    setError(null);
    setIsLoading(false);
    generation.setContent(m.content ?? "");
  }, [moduleIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = module.status;
  const currentStep = getStepIndex(status);

  // --- Step 1: Fetch prerequisites ---
  const startPrerequisites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    updateModule(moduleIndex, { status: "interviewing-prereqs" });

    try {
      const res = await fetch("/api/curriculum/module/prerequisites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseInfo,
          moduleName: module.name,
          moduleDescription: module.description,
          moduleIndex,
          totalModules: modules.length,
          previousModules: modules.slice(0, moduleIndex),
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch prerequisites");
      const data = await res.json();

      const parsed: Prerequisite[] = (data.prerequisites ?? []).map(
        (p: { name: string; description: string; status: string }) => ({
          id: generateId(),
          name: p.name,
          description: p.description,
          status: p.status as Prerequisite["status"],
        })
      );

      setPrereqs(parsed);
      updateModule(moduleIndex, {
        status: "interviewing-prereqs",
        prerequisites: parsed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      updateModule(moduleIndex, { status: "pending" });
    } finally {
      setIsLoading(false);
    }
  }, [courseInfo, module, moduleIndex, modules, updateModule]);

  // --- Step 1 confirm ---
  const confirmPrereqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    updateModule(moduleIndex, {
      status: "interviewing-concepts",
      prerequisites: prereqs,
    });

    try {
      const res = await fetch("/api/curriculum/module/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseInfo,
          moduleName: module.name,
          moduleDescription: module.description,
          moduleIndex,
          prerequisites: prereqs,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch concepts");
      const data = await res.json();

      const parsed: CoreConcept[] = (data.concepts ?? []).map(
        (c: { name: string; description: string; priority: string }) => ({
          id: generateId(),
          name: c.name,
          description: c.description,
          priority: c.priority as CoreConcept["priority"],
        })
      );

      setConcepts(parsed);
      updateModule(moduleIndex, {
        status: "interviewing-concepts",
        coreConcepts: parsed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      updateModule(moduleIndex, { status: "prereqs-confirmed" });
    } finally {
      setIsLoading(false);
    }
  }, [courseInfo, module, moduleIndex, prereqs, updateModule]);

  // --- Step 2 confirm ---
  const confirmConcepts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    updateModule(moduleIndex, {
      status: "interviewing-lessons",
      coreConcepts: concepts,
    });

    try {
      const res = await fetch("/api/curriculum/module/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseInfo,
          moduleName: module.name,
          moduleDescription: module.description,
          moduleIndex,
          prerequisites: prereqs,
          concepts,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch lessons");
      const data = await res.json();

      const parsedLessons: LessonPlanItem[] = (data.lessons ?? []).map(
        (l: {
          title: string;
          description: string;
          teachingApproach: string;
        }) => ({
          id: generateId(),
          title: l.title,
          description: l.description,
          teachingApproach: l.teachingApproach,
          enabled: true,
        })
      );

      const parsedActivities: ActivityItem[] = (data.activities ?? []).map(
        (a: { title: string; description: string; type: string }) => ({
          id: generateId(),
          title: a.title,
          description: a.description,
          type: a.type,
          enabled: true,
        })
      );

      setLessons(parsedLessons);
      setActivities(parsedActivities);
      updateModule(moduleIndex, {
        status: "interviewing-lessons",
        lessonPlan: {
          lessons: parsedLessons,
          activities: parsedActivities,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      updateModule(moduleIndex, { status: "concepts-confirmed" });
    } finally {
      setIsLoading(false);
    }
  }, [courseInfo, module, moduleIndex, prereqs, concepts, updateModule]);

  // --- Step 3 approve & generate ---
  const approveLessonsAndGenerate = useCallback(async () => {
    const plan = { lessons, activities };
    updateModule(moduleIndex, { status: "generating", lessonPlan: plan });

    const content = await generation.stream(
      "/api/curriculum/module/generate",
      {
        courseInfo,
        moduleName: module.name,
        moduleIndex,
        prerequisites: prereqs,
        concepts,
        lessonPlan: plan,
        previousModules: modules.slice(0, moduleIndex),
      }
    );

    updateModule(moduleIndex, { status: "complete", content });
  }, [
    courseInfo,
    module,
    moduleIndex,
    modules,
    prereqs,
    concepts,
    lessons,
    activities,
    generation,
    updateModule,
  ]);

  // --- Progress indicator ---
  const progressIndicator = (
    <div className="flex items-center gap-1 mb-6">
      {INTERVIEW_STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors",
              i < currentStep && "bg-green-100 text-green-800",
              i === currentStep && "bg-primary text-primary-foreground",
              i > currentStep && "bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                i < currentStep && "bg-green-200",
                i === currentStep && "bg-primary-foreground/20",
                i > currentStep && "bg-muted-foreground/20"
              )}
            >
              {i < currentStep ? "✓" : i + 1}
            </span>
            {step.label}
          </div>
          {i < INTERVIEW_STEPS.length - 1 && (
            <div
              className={cn(
                "w-6 h-px mx-1",
                i < currentStep ? "bg-green-300" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {progressIndicator}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Step 1: Prerequisites */}
      {status === "pending" && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Start the interview to design this module step by step.
          </p>
          <Button onClick={startPrerequisites} disabled={isLoading}>
            {isLoading ? "Loading..." : "Start Interview"}
          </Button>
        </div>
      )}

      {status === "interviewing-prereqs" && (
        <>
          {isLoading && prereqs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading prerequisites...
            </div>
          ) : (
            <PrerequisitesStep
              prerequisites={prereqs}
              onChange={setPrereqs}
              onConfirm={confirmPrereqs}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Step 2: Concepts */}
      {(status === "prereqs-confirmed" ||
        status === "interviewing-concepts") && (
        <>
          {isLoading && concepts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading concepts based on your prerequisites...
            </div>
          ) : (
            <ConceptsStep
              concepts={concepts}
              moduleName={module.name}
              onChange={setConcepts}
              onConfirm={confirmConcepts}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Step 3: Lessons & Activities */}
      {(status === "concepts-confirmed" ||
        status === "interviewing-lessons") && (
        <>
          {isLoading && lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Planning lessons and activities...
            </div>
          ) : (
            <LessonsStep
              lessons={lessons}
              activities={activities}
              onLessonsChange={setLessons}
              onActivitiesChange={setActivities}
              onApprove={approveLessonsAndGenerate}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Step 4: Generate */}
      {(status === "lessons-approved" || status === "generating") && (
        <div>
          <h3 className="font-semibold text-lg mb-3">
            Step 4: Generating Module Content
          </h3>
          <div className="rounded-lg border p-4 bg-muted/30">
            <StreamingText
              content={generation.content}
              isStreaming={generation.isStreaming}
            />
          </div>
        </div>
      )}

      {/* Complete */}
      {status === "complete" && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Module Content</h3>
          <div className="rounded-lg border p-4 bg-muted/30">
            <StreamingText
              content={module.content ?? generation.content}
              isStreaming={false}
            />
          </div>
        </div>
      )}

      {/* Legacy statuses */}
      {(status === "proposing" ||
        status === "proposed" ||
        status === "approved") && (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            This module was started with the old flow. The proposal is saved
            below.
          </p>
          {module.proposal && (
            <div className="mt-4 rounded-lg border p-4 bg-muted/30 text-left">
              <StreamingText content={module.proposal} isStreaming={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
