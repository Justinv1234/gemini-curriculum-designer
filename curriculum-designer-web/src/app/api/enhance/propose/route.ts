import { getAnthropicClient } from "@/lib/claude/client";
import { ENHANCE_SYSTEM_PROMPT, MODEL } from "@/lib/claude/prompts";
import { buildEnhancementProposalsPrompt } from "@/lib/claude/enhance";
import type { AnalysisReport } from "@/lib/types/curriculum";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { analysisReport, whatsNewContent } = body as {
      analysisReport: AnalysisReport;
      whatsNewContent: string;
    };

    if (!analysisReport || !whatsNewContent) {
      return new Response("Missing required fields", { status: 400 });
    }

    const client = getAnthropicClient();
    const userPrompt = buildEnhancementProposalsPrompt(
      analysisReport,
      whatsNewContent
    );

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: ENHANCE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse proposals response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch (error) {
    console.error("Propose API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
