import { getAnthropicClient } from "@/lib/claude/client";
import { SYSTEM_PROMPT, MODEL, MAX_TOKENS } from "@/lib/claude/prompts";
import {
  buildModuleGenerationPrompt,
  buildModuleGenerationPromptFromInterview,
} from "@/lib/claude/module";
import type {
  CourseInfo,
  CurriculumModule,
  Prerequisite,
  CoreConcept,
  ModuleLessonPlan,
} from "@/lib/types/curriculum";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      courseInfo,
      moduleName,
      moduleIndex,
      // Legacy fields
      proposal,
      // Interview fields
      prerequisites,
      concepts,
      lessonPlan,
      previousModules,
    } = body as {
      courseInfo: CourseInfo;
      moduleName: string;
      moduleIndex: number;
      proposal?: string;
      prerequisites?: Prerequisite[];
      concepts?: CoreConcept[];
      lessonPlan?: ModuleLessonPlan;
      previousModules: CurriculumModule[];
    };

    if (!courseInfo || !moduleName) {
      return new Response("Missing required fields", { status: 400 });
    }

    const client = getAnthropicClient();

    // Choose prompt builder based on whether we have interview data or legacy proposal
    let userPrompt: string;
    if (prerequisites && concepts && lessonPlan) {
      userPrompt = buildModuleGenerationPromptFromInterview(
        courseInfo,
        moduleName,
        moduleIndex,
        prerequisites,
        concepts,
        lessonPlan,
        previousModules
      );
    } else if (proposal) {
      userPrompt = buildModuleGenerationPrompt(
        courseInfo,
        moduleName,
        moduleIndex,
        proposal,
        previousModules
      );
    } else {
      return new Response(
        "Missing required fields: either proposal or interview data needed",
        { status: 400 }
      );
    }

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Module generate API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
