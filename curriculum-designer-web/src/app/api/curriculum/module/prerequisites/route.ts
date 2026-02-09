import { getAnthropicClient } from "@/lib/claude/client";
import { SYSTEM_PROMPT, MODEL } from "@/lib/claude/prompts";
import { buildPrerequisitesPrompt } from "@/lib/claude/module";
import type { CourseInfo, CurriculumModule } from "@/lib/types/curriculum";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      courseInfo,
      moduleName,
      moduleDescription,
      moduleIndex,
      totalModules,
      previousModules,
    } = body as {
      courseInfo: CourseInfo;
      moduleName: string;
      moduleDescription?: string;
      moduleIndex: number;
      totalModules: number;
      previousModules: CurriculumModule[];
    };

    if (!courseInfo || !moduleName) {
      return new Response("Missing required fields", { status: 400 });
    }

    const client = getAnthropicClient();
    const userPrompt = buildPrerequisitesPrompt(
      courseInfo,
      moduleName,
      moduleDescription,
      moduleIndex,
      totalModules,
      previousModules
    );

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from the response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse prerequisites response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch (error) {
    console.error("Prerequisites API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
