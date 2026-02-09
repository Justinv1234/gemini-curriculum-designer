"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StreamingText } from "@/components/shared/StreamingText";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { useStreaming } from "@/lib/hooks/useStreaming";
import { cn } from "@/lib/utils";
import type { AssessmentType } from "@/lib/types/curriculum";

const assessmentOptions: { value: AssessmentType; label: string; description: string; icon: string }[] = [
  { value: "quizzes", label: "Quizzes", description: "Knowledge checks with MCQ, short answer, and code analysis", icon: "\u2753" },
  { value: "labs", label: "Practical Labs", description: "Hands-on skill assessments with rubrics", icon: "\uD83D\uDD27" },
  { value: "projects", label: "Projects", description: "Applied learning with milestones and deliverables", icon: "\uD83D\uDCC1" },
  { value: "written", label: "Written Assignments", description: "Analysis, reflection, and essay prompts", icon: "\u270D\uFE0F" },
  { value: "peer-reviews", label: "Peer Reviews", description: "Collaborative assessment and feedback forms", icon: "\uD83D\uDC65" },
  { value: "portfolio", label: "Portfolio", description: "Cumulative demonstration of skills", icon: "\uD83C\uDFC6" },
];

export default function Phase3Page() {
  const router = useRouter();
  const {
    courseInfo,
    modules,
    selectedAssessmentTypes,
    assessmentsContent,
    setSelectedAssessmentTypes,
    setAssessmentsContent,
    setCurrentPhase,
  } = useCurriculumStore();

  const { content, isStreaming, stream } = useStreaming();

  if (!courseInfo || modules.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Please complete Phase 2 first.</p>
        <Button onClick={() => router.push("/design/phase-2")}>Go to Phase 2</Button>
      </div>
    );
  }

  const toggleType = (type: AssessmentType) => {
    const current = selectedAssessmentTypes;
    if (current.includes(type)) {
      setSelectedAssessmentTypes(current.filter((t) => t !== type));
    } else {
      setSelectedAssessmentTypes([...current, type]);
    }
  };

  const handleGenerate = async () => {
    const result = await stream("/api/curriculum/assessment", {
      courseInfo,
      modules,
      assessmentTypes: selectedAssessmentTypes,
    });
    setAssessmentsContent(result);
  };

  const handleContinue = () => {
    setCurrentPhase(3);
    router.push("/design/phase-4");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Phase 3: Assessment Design</h1>
      <p className="text-muted-foreground mb-8">
        Select assessment types and generate comprehensive assessments with rubrics.
      </p>

      {/* Assessment type selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {assessmentOptions.map((option) => {
          const isSelected = selectedAssessmentTypes.includes(option.value);
          return (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/30"
              )}
              onClick={() => toggleType(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "ml-auto mt-1 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && <span className="text-xs">{"\u2713"}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={selectedAssessmentTypes.length === 0 || isStreaming}
        size="lg"
        className="mb-8"
      >
        {isStreaming ? "Generating Assessments..." : "Generate Assessments"}
      </Button>

      {/* Results */}
      {(content || assessmentsContent) && (
        <div className="space-y-6">
          <div className="rounded-lg border p-6 bg-card">
            <StreamingText
              content={content || assessmentsContent || ""}
              isStreaming={isStreaming}
            />
          </div>

          {!isStreaming && (content || assessmentsContent) && (
            <Button onClick={handleContinue} size="lg">
              Continue to Delivery Templates
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
