import { getAnthropicClient } from "@/lib/claude/client";
import { ENHANCE_SYSTEM_PROMPT, MODEL, MAX_TOKENS } from "@/lib/claude/prompts";
import { buildTargetedUpdatePrompt } from "@/lib/claude/enhance";
import type { AnalysisReport, EnhancementProposal } from "@/lib/types/curriculum";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { proposal, analysisReport, whatsNewContent } = body as {
      proposal: EnhancementProposal;
      analysisReport: AnalysisReport;
      whatsNewContent: string;
    };

    if (!proposal || !analysisReport || !whatsNewContent) {
      return new Response("Missing required fields", { status: 400 });
    }

    const client = getAnthropicClient();
    const userPrompt = buildTargetedUpdatePrompt(
      proposal,
      analysisReport,
      whatsNewContent
    );

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: ENHANCE_SYSTEM_PROMPT,
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
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
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
    console.error("Update API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
