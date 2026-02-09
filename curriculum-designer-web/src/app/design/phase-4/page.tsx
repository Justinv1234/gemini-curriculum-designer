"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StreamingText } from "@/components/shared/StreamingText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { useStreaming } from "@/lib/hooks/useStreaming";
import { cn } from "@/lib/utils";
import type { DeliveryFormat } from "@/lib/types/curriculum";

const deliveryOptions: {
  value: DeliveryFormat;
  label: string;
  description: string;
  icon: string;
  details: string;
  strengths: string[];
  bestFor: string;
}[] = [
  {
    value: "slides",
    label: "Slide Decks",
    description: "Reveal.js / Markdown presentation slides",
    icon: "\uD83D\uDCCA",
    details:
      "Generates presentation slides in Reveal.js/Markdown format. Each slide has clear structure with bullet points, code examples, and visual placeholders. Can be converted to PowerPoint or presented directly in a browser.",
    strengths: [
      "Great for live lectures and workshops",
      "Visual structure helps pace delivery",
      "Easy to share and present from any device",
    ],
    bestFor: "Instructors who teach live sessions or recorded lectures",
  },
  {
    value: "jupyter",
    label: "Jupyter Notebooks",
    description: "Interactive coding lessons with exercises",
    icon: "\uD83D\uDCD3",
    details:
      "Creates interactive notebooks that mix explanatory text, runnable code cells, and exercises. Students can read, run, and modify code in the same document. Includes \"YOUR CODE HERE\" placeholders for practice.",
    strengths: [
      "Interactive — students learn by doing",
      "Code and explanation live together",
      "Self-checking with assertion cells",
    ],
    bestFor: "Programming, data science, or any technical hands-on course",
  },
  {
    value: "lms",
    label: "LMS Package",
    description: "Canvas/Moodle course structure and content",
    icon: "\uD83C\uDFEB",
    details:
      "Generates a complete Learning Management System structure compatible with Canvas, Moodle, or similar platforms. Includes module pages, lesson content in HTML, quiz definitions, and assignment structures. Provides directory trees and file templates.",
    strengths: [
      "Ready to upload to institutional LMS",
      "Includes quizzes in standard format",
      "Familiar structure for students",
    ],
    bestFor: "University or corporate training with an existing LMS",
  },
  {
    value: "video-scripts",
    label: "Video Scripts",
    description: "Complete video course scripts with production notes",
    icon: "\uD83C\uDFA5",
    details:
      "Produces timed scripts for video lessons with sections for intro, concept explanation, demonstration, practice, and wrap-up. Includes visual cues (what to show on screen), B-roll suggestions, and post-production notes like editing cues and chapter markers.",
    strengths: [
      "Professional production-ready scripts",
      "Timed sections for consistent pacing",
      "Visual + audio cues for editors",
    ],
    bestFor: "Creating online video courses (YouTube, Udemy, Coursera-style)",
  },
  {
    value: "github-repo",
    label: "GitHub Repository",
    description: "Full repo structure with code, docs, and CI",
    icon: "\uD83D\uDCC2",
    details:
      "Generates a complete repository structure with folders for modules, labs, projects, and resources. Includes README templates, a syllabus, contributing guide for TAs, exercise starters with solutions, and GitHub Actions for auto-grading.",
    strengths: [
      "Industry-standard code sharing",
      "Version control for course materials",
      "Auto-grading with GitHub Actions",
    ],
    bestFor: "Technical courses where students work with code",
  },
];

export default function Phase4Page() {
  const router = useRouter();
  const {
    courseInfo,
    modules,
    selectedDeliveryFormats,
    deliveryContent,
    setSelectedDeliveryFormats,
    setDeliveryContent,
    setCurrentPhase,
  } = useCurriculumStore();

  const { content, isStreaming, stream } = useStreaming();
  const [showFullContent, setShowFullContent] = useState(false);

  if (!courseInfo || modules.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">
          Please complete Phase 3 first.
        </p>
        <Button onClick={() => router.push("/design/phase-3")}>
          Go to Phase 3
        </Button>
      </div>
    );
  }

  const toggleFormat = (format: DeliveryFormat) => {
    const current = selectedDeliveryFormats;
    if (current.includes(format)) {
      setSelectedDeliveryFormats(current.filter((f) => f !== format));
    } else {
      setSelectedDeliveryFormats([...current, format]);
    }
  };

  const handleGenerate = async () => {
    setShowFullContent(false);
    const result = await stream("/api/curriculum/delivery", {
      courseInfo,
      modules,
      deliveryFormats: selectedDeliveryFormats,
    });
    setDeliveryContent(result);
  };

  const handleContinue = () => {
    setCurrentPhase(4);
    router.push("/design/review");
  };

  const displayContent = content || deliveryContent || "";

  // Extract section headers from the content for the summary view
  const sections = displayContent
    .split(/^## /gm)
    .filter(Boolean)
    .map((section) => {
      const lines = section.split("\n");
      const title = lines[0]?.trim() ?? "";
      const body = lines.slice(1).join("\n").trim();
      // Get first ~200 chars as preview
      const preview =
        body.length > 200 ? body.substring(0, 200) + "..." : body;
      return { title, body, preview };
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Phase 4: Delivery Templates</h1>
      <p className="text-muted-foreground mb-8">
        Select delivery formats and generate ready-to-use templates. Click any
        card to learn more about the format.
      </p>

      {/* Delivery format selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {deliveryOptions.map((option) => {
          const isSelected = selectedDeliveryFormats.includes(option.value);
          return (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/30"
              )}
              onClick={() => toggleFormat(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                    {/* Expanded details */}
                    <div className="mt-2 pt-2 border-t border-dashed">
                      <p className="text-xs text-muted-foreground">
                        {option.details}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs font-medium">Strengths:</p>
                        <ul className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                          {option.strengths.map((s, i) => (
                            <li key={i}>+ {s}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs mt-1.5">
                        <span className="font-medium">Best for:</span>{" "}
                        <span className="text-muted-foreground">
                          {option.bestFor}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-1 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && (
                      <span className="text-xs">{"\u2713"}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={selectedDeliveryFormats.length === 0 || isStreaming}
        size="lg"
        className="mb-8"
      >
        {isStreaming ? "Generating Templates..." : "Generate Templates"}
      </Button>

      {/* Results */}
      {displayContent && (
        <div className="space-y-6">
          {/* While streaming, show full content */}
          {isStreaming && (
            <div className="rounded-lg border p-6 bg-card">
              <StreamingText content={displayContent} isStreaming={true} />
            </div>
          )}

          {/* After streaming, show summary with expandable sections */}
          {!isStreaming && sections.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Generated Templates ({sections.length} sections)
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullContent(!showFullContent)}
                >
                  {showFullContent ? "Show Summary" : "Show Full Content"}
                </Button>
              </div>

              {showFullContent ? (
                <div className="rounded-lg border p-6 bg-card">
                  <StreamingText
                    content={displayContent}
                    isStreaming={false}
                  />
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {sections.map((section, i) => (
                    <AccordionItem
                      key={i}
                      value={`section-${i}`}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-sm font-medium">
                        {section.title || `Section ${i + 1}`}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="rounded-lg bg-muted/30 p-4">
                          <StreamingText
                            content={section.body}
                            isStreaming={false}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          )}

          {!isStreaming && displayContent && (
            <Button onClick={handleContinue} size="lg">
              Continue to Review & Export
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
