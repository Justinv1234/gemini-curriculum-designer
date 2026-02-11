import type { UploadedFile, AnalysisReport, EnhancementProposal, WhatsNewItem } from "@/lib/types/curriculum";

/**
 * Build a prompt to analyze uploaded curriculum files.
 * This is the ONLY prompt that receives raw file contents.
 * Pattern: dual output (readable markdown + json-analysis tagged block).
 */
export function buildAnalysisPrompt(files: UploadedFile[]): string {
  const fileList = files
    .map((f, i) => `--- FILE ${i + 1}: ${f.name} ---\n${f.content}\n--- END FILE ${i + 1} ---`)
    .join("\n\n");

  return `Please analyze the following curriculum materials:

${fileList}

Provide a comprehensive analysis with the following sections:

## Course Overview
Identify the course name/topic, format, depth level, and total number of modules or sections.

## Content Inventory
For each module/section found, list:
- Module name
- Topics covered
- Estimated recency (based on tools, frameworks, and examples mentioned)
- Status: "current" (up-to-date), "needs-update" (somewhat dated), or "outdated" (significantly dated)

## Strengths
List 3-5 strengths of the existing curriculum (what's done well).

## Gaps & Opportunities
List gaps and improvement opportunities, categorizing each as:
- **missing**: Important topics not covered
- **outdated**: Content that needs updating
- **opportunity**: Areas where the curriculum could be enhanced

---

**IMPORTANT — After all the readable content above, append this structured JSON block exactly as shown (it will be parsed by the app):**

\`\`\`json-analysis
{
  "courseName": "Detected course name",
  "moduleCount": 5,
  "format": "e.g. semester, bootcamp, self-paced",
  "depth": "e.g. introductory, intermediate, advanced",
  "contentInventory": [
    {
      "moduleName": "Module name",
      "topicsCovered": ["topic1", "topic2"],
      "estimatedRecency": "e.g. 2023, current, 2-3 years old",
      "status": "current|needs-update|outdated"
    }
  ],
  "gaps": [
    { "type": "missing|outdated|opportunity", "description": "Description" }
  ],
  "strengths": [
    { "description": "Strength description" }
  ]
}
\`\`\`

Make sure the JSON block contains the same information as the readable sections above, just structured as JSON. The JSON must be valid and parseable.`;
}

/**
 * Build a prompt for "What's New" research based on the analysis report.
 * Does NOT receive raw file contents — works from structured analysis only.
 * Output: pure streamed markdown.
 */
export function buildWhatsNewPrompt(analysisReport: AnalysisReport): string {
  const inventorySummary = analysisReport.contentInventory
    .map((item) => `- ${item.moduleName} (${item.status}, ~${item.estimatedRecency}): ${item.topicsCovered.join(", ")}`)
    .join("\n");

  const primaryGaps = analysisReport.gaps.filter((g) => g.action === "include");
  const deferredGaps = analysisReport.gaps.filter((g) => g.action === "defer");

  const gapSummary = primaryGaps
    .map((g) => `- [${g.type}] ${g.description}`)
    .join("\n");

  const deferredSummary = deferredGaps.length > 0
    ? `\n\nLower priority gaps (address if relevant):\n${deferredGaps.map((g) => `- [${g.type}] ${g.description}`).join("\n")}`
    : "";

  return `I have an existing curriculum for "${analysisReport.courseName}" with ${analysisReport.moduleCount} modules at the ${analysisReport.depth} level (${analysisReport.format} format).

Here is the content inventory:
${inventorySummary}

Primary gaps to address:
${gapSummary || "(none selected)"}${deferredSummary}

Please research and provide a comprehensive "What's New" report. For each finding, provide a title, a brief summary, and detailed content.

Focus especially on areas where the curriculum has gaps or outdated content. Be specific and actionable — mention exact tools, versions, and resources by name.

---

**IMPORTANT — After all the readable content above, append this structured JSON block exactly as shown (it will be parsed by the app):**

\`\`\`json-whatsnew
[
  {
    "title": "Finding title",
    "summary": "One-sentence summary",
    "details": "Full markdown details with examples, links, and specifics",
    "category": "recent-developments|industry-trends|updated-resources|pedagogical-updates"
  }
]
\`\`\`

Categories:
- "recent-developments": New tools, frameworks, versions, methodologies
- "industry-trends": Current industry direction and demands
- "updated-resources": New books, courses, tutorials, documentation
- "pedagogical-updates": Teaching approaches and educational technology

Aim for 6-12 items across all categories. The JSON must be valid and parseable.`;
}

/**
 * Build a prompt to generate enhancement proposals.
 * JSON-only response (no streaming needed).
 */
export function buildEnhancementProposalsPrompt(
  analysisReport: AnalysisReport,
  whatsNewContent: string,
  whatsNewItems?: WhatsNewItem[] | null
): string {
  const inventorySummary = analysisReport.contentInventory
    .map((item) => `- ${item.moduleName} (${item.status})`)
    .join("\n");

  const primaryGaps = analysisReport.gaps.filter((g) => g.action === "include");
  const deferredGaps = analysisReport.gaps.filter((g) => g.action === "defer");

  const gapSummary = primaryGaps
    .map((g) => `- [${g.type}] ${g.description}`)
    .join("\n");

  const deferredSummary = deferredGaps.length > 0
    ? `\n\nLower priority gaps:\n${deferredGaps.map((g) => `- [${g.type}] ${g.description}`).join("\n")}`
    : "";

  // Use selected What's New items if available, otherwise fall back to raw content
  let researchSection: string;
  if (whatsNewItems && whatsNewItems.length > 0) {
    const selectedItems = whatsNewItems.filter((item) => item.selected);
    researchSection = selectedItems
      .map((item) => `### ${item.title}\n${item.summary}\n${item.details}`)
      .join("\n\n");
  } else {
    researchSection = whatsNewContent;
  }

  return `Based on the analysis of "${analysisReport.courseName}" and recent research, generate specific enhancement proposals.

Current modules:
${inventorySummary}

Primary gaps to address:
${gapSummary || "(none selected)"}${deferredSummary}

Recent research findings:
${researchSection}

Generate 6-10 specific enhancement proposals. For each proposal, provide:
- A descriptive title
- A detailed description of what the enhancement involves
- Category: one of "update-outdated", "add-modules", "refresh-examples", "add-delivery", "enhance-assessments", "add-interactive"
- Impact: "high", "medium", or "low" based on how much it would improve learning outcomes

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):

{
  "proposals": [
    {
      "category": "update-outdated|add-modules|refresh-examples|add-delivery|enhance-assessments|add-interactive",
      "title": "Proposal title",
      "description": "Detailed description",
      "impact": "high|medium|low"
    }
  ]
}`;
}

/**
 * Build a prompt to generate a targeted update for one proposal.
 * SSE streamed markdown + json-change block.
 */
export function buildTargetedUpdatePrompt(
  proposal: EnhancementProposal,
  analysisReport: AnalysisReport,
  whatsNewContent: string,
  feedback?: string
): string {
  const relevantModules = analysisReport.contentInventory
    .map((item) => `- ${item.moduleName} (${item.status}): ${item.topicsCovered.join(", ")}`)
    .join("\n");

  const feedbackSection = feedback
    ? `\n\n**User Feedback (please address these concerns):**\n${feedback}\n`
    : "";

  return `I need you to generate a specific curriculum update for the following enhancement:

**Enhancement:** ${proposal.title}
**Category:** ${proposal.category}
**Description:** ${proposal.description}${feedbackSection}

**Context — Current curriculum "${analysisReport.courseName}":**
${relevantModules}

**Recent research findings (summary):**
${whatsNewContent.slice(0, 2000)}

Please generate the update:

## Enhancement: ${proposal.title}

### What Changes
Describe exactly what content is being added, updated, or modified.

### Updated Content
Provide the full new or updated content in curriculum-ready format with:
- Learning objectives (using Bloom's taxonomy verbs)
- Content sections with clear explanations
- Practical examples and exercises
- Discussion questions where appropriate

If this is an update to existing content, clearly indicate what was before and what is after. If this is new content, just provide the new material.

---

**IMPORTANT — After all the readable content above, append this structured JSON block:**

\`\`\`json-change
{
  "title": "${proposal.title}",
  "before": "Brief summary of original content (or null if new addition)",
  "after": "Brief summary of the updated/new content"
}
\`\`\`

The JSON must be valid and parseable.`;
}
