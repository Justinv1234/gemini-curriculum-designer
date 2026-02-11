"use client";

import Link from "next/link";
import { PhaseIndicator } from "./PhaseIndicator";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function WizardShell({ children }: { children: React.ReactNode }) {
  const reset = useCurriculumStore((s) => s.reset);
  const mode = useCurriculumStore((s) => s.mode);
  const courseInfo = useCurriculumStore((s) => s.courseInfo);
  const analysisReport = useCurriculumStore((s) => s.analysisReportStructured);

  const contextLabel = mode === "enhance"
    ? analysisReport?.courseName
    : courseInfo?.topic;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-16 flex-col border-r bg-card md:w-64">
        <div className="flex h-14 items-center px-3 md:px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">&#x1F393;</span>
            <span className="hidden md:inline text-sm">Curriculum Designer</span>
          </Link>
        </div>
        <Separator />
        <div className="flex-1 px-2 py-4 md:px-3">
          <p className="mb-3 hidden px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:block">
            {mode === "enhance" ? "Enhancement Steps" : "Phases"}
          </p>
          <PhaseIndicator />
        </div>
        {contextLabel && (
          <>
            <Separator />
            <div className="hidden p-4 md:block">
              <p className="text-xs text-muted-foreground mb-1">
                {mode === "enhance" ? "Course" : "Topic"}
              </p>
              <p className="text-sm font-medium truncate">{contextLabel}</p>
            </div>
          </>
        )}
        <Separator />
        <div className="p-2 md:p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => {
              if (confirm("Start over? All progress will be lost.")) {
                reset();
                window.location.href = "/";
              }
            }}
          >
            <span className="hidden md:inline">Start Over</span>
            <span className="md:hidden">&#x21BB;</span>
          </Button>
        </div>
        <div className="hidden md:block px-3 pb-3">
          <p className="text-[10px] text-muted-foreground/60 text-center leading-tight">
            Developed by Dr. Weihao Qu
            <br />
            CSSE Dept, Monmouth University
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
