"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useCurriculumStore } from "@/lib/store/curriculum-store";

const features = [
  {
    icon: "\uD83C\uDFAF",
    title: "Course Vision",
    description: "Define your topic, audience, and teaching philosophy. Get AI-powered research on current trends.",
  },
  {
    icon: "\uD83D\uDCDA",
    title: "Module Design",
    description: "Build detailed modules with learning objectives, lessons, exercises, and discussion questions.",
  },
  {
    icon: "\uD83D\uDCDD",
    title: "Assessments",
    description: "Generate quizzes, labs, projects, peer reviews, and portfolios with complete rubrics.",
  },
  {
    icon: "\uD83D\uDE80",
    title: "Delivery Templates",
    description: "Get slide decks, Jupyter notebooks, LMS packages, video scripts, and GitHub repo structures.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const setMode = useCurriculumStore((s) => s.setMode);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <span className="text-lg font-semibold">Curriculum Designer</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Design Complete Curricula
          <br />
          <span className="text-muted-foreground">with AI Assistance</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Create structured, modern curricula with assessments, rubrics, and delivery
          templates. Powered by AI instructional design expertise.
        </p>

        {/* Two-card entry */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          <Card
            className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg"
            onClick={() => {
              setMode("create");
              router.push("/design/phase-1");
            }}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-5xl mb-4">&#x2795;</div>
              <h3 className="text-xl font-semibold mb-2">Create New Curriculum</h3>
              <p className="text-sm text-muted-foreground">
                Build a structured curriculum from scratch with AI-guided research,
                module design, assessments, and delivery templates.
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg"
            onClick={() => {
              setMode("enhance");
              router.push("/design/enhance/step-1");
            }}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-5xl mb-4">&#x1F504;</div>
              <h3 className="text-xl font-semibold mb-2">Enhance Existing Curriculum</h3>
              <p className="text-sm text-muted-foreground">
                Upload your existing course materials for AI-powered analysis,
                gap identification, and targeted improvements.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Describe Your Course</h3>
              <p className="text-sm text-muted-foreground">
                Enter your topic, audience level, format, and teaching philosophy — or upload existing materials.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Generates Content</h3>
              <p className="text-sm text-muted-foreground">
                Watch as AI creates modules, assessments, and delivery templates in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Review & Export</h3>
              <p className="text-sm text-muted-foreground">
                Edit the results, then download everything as Markdown or PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          Developed and designed by Dr. Weihao Qu, CSSE Department, Monmouth University
        </div>
      </footer>
    </div>
  );
}
