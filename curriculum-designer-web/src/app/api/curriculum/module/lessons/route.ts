import { getAnthropicClient } from "@/lib/claude/client";
import { SYSTEM_PROMPT, MODEL } from "@/lib/claude/prompts";
import { buildLessonsPrompt } from "@/lib/claude/module";
import type { CourseInfo, Prerequisite, CoreConcept } from "@/lib/types/curriculum";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      courseInfo,
      moduleName,
      moduleDescription,
      moduleIndex,
      prerequisites,
      concepts,
    } = body as {
      courseInfo: CourseInfo;
      moduleName: string;
      moduleDescription?: string;
      moduleIndex: number;
      prerequisites: Prerequisite[];
      concepts: CoreConcept[];
    };

    if (!courseInfo || !moduleName || !prerequisites || !concepts) {
      return new Response("Missing required fields", { status: 400 });
    }

    const client = getAnthropicClient();
    const userPrompt = buildLessonsPrompt(
      courseInfo,
      moduleName,
      moduleDescription,
      moduleIndex,
      prerequisites,
      concepts
    );

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse lessons response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch (error) {
    console.error("Lessons API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
