import { getAnthropicClient } from "@/lib/claude/client";
import { SYSTEM_PROMPT, MODEL } from "@/lib/claude/prompts";
import { buildConceptsPrompt } from "@/lib/claude/module";
import type { CourseInfo, Prerequisite } from "@/lib/types/curriculum";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      courseInfo,
      moduleName,
      moduleDescription,
      moduleIndex,
      prerequisites,
    } = body as {
      courseInfo: CourseInfo;
      moduleName: string;
      moduleDescription?: string;
      moduleIndex: number;
      prerequisites: Prerequisite[];
    };

    if (!courseInfo || !moduleName || !prerequisites) {
      return new Response("Missing required fields", { status: 400 });
    }

    const client = getAnthropicClient();
    const userPrompt = buildConceptsPrompt(
      courseInfo,
      moduleName,
      moduleDescription,
      moduleIndex,
      prerequisites
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
        { error: "Failed to parse concepts response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch (error) {
    console.error("Concepts API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
