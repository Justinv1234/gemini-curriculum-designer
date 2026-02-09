import type { CourseInfo, CurriculumModule, DeliveryFormat } from "@/lib/types/curriculum";

const DELIVERY_LABELS: Record<DeliveryFormat, string> = {
  slides: "Slide Decks (Reveal.js / Markdown format)",
  jupyter: "Jupyter Notebooks (interactive coding lessons)",
  lms: "LMS Package Structure (Canvas/Moodle)",
  "video-scripts": "Video Course Scripts (with production notes)",
  "github-repo": "GitHub Repository Structure (code + docs)",
};

export function buildDeliveryPrompt(
  courseInfo: CourseInfo,
  modules: CurriculumModule[],
  deliveryFormats: DeliveryFormat[]
): string {
  const moduleList = modules
    .map((m, i) => `${i + 1}. ${m.name}`)
    .join("\n");

  const selectedFormats = deliveryFormats
    .map((f) => `- ${DELIVERY_LABELS[f]}`)
    .join("\n");

  return `I'm creating delivery templates for a course on "${courseInfo.topic}" for ${courseInfo.audience} students in a ${courseInfo.format} format using a ${courseInfo.philosophy} approach.

**Course Modules:**
${moduleList}

**Selected Delivery Formats:**
${selectedFormats}

Generate complete delivery templates for this course. For each selected format, create a template for Module 1 as an example, then provide structure guidance for remaining modules.

${deliveryFormats.includes("slides") ? `
## Slide Deck Template (Module 1)

Create a complete Reveal.js/Markdown slide deck for Module 1 with:
- Title slide with course and instructor info
- Learning objectives slide
- Agenda slide with timing
- Content slides with key concepts (max 3 bullet points per slide)
- Visual/diagram description slides
- Code example slides
- Hands-on exercise slide with instructions
- Solution slide
- Key takeaways slide
- Next session preview
- Q&A slide

Use Markdown slide format with --- separators.
` : ""}

${deliveryFormats.includes("jupyter") ? `
## Jupyter Notebook Template (Module 1)

Create a complete notebook structure for Module 1 with:
- Title and setup cells (markdown + code)
- Section explanations (2-3 paragraphs each)
- Demonstration code cells with comments
- Exercise cells with "YOUR CODE HERE" placeholders
- Hidden solution cells using <details> tags
- Test/assertion cells for self-checking
- Summary table and next steps

Format as a series of markdown and code cell descriptions.
` : ""}

${deliveryFormats.includes("lms") ? `
## LMS Package Structure

Create a complete LMS export structure with:
- Directory tree showing all files
- Module landing page HTML template
- Lesson content HTML template
- Quiz in QTI-compatible format description
- Canvas-specific export structure notes
- Moodle-specific structure notes
` : ""}

${deliveryFormats.includes("video-scripts") ? `
## Video Script Template (Module 1, Lesson 1)

Create a complete video script with:
- Pre-production checklist (equipment, assets)
- Timed script sections:
  - [0:00-0:30] Hook & Intro
  - [0:30-3:00] Concept Explanation
  - [3:00-7:00] Demonstration
  - [7:00-8:30] Practice Prompt
  - [8:30-9:30] Solution & Explanation
  - [9:30-10:00] Wrap-up
- Visual cues (VISUAL:), script text (SCRIPT:), B-roll suggestions
- Post-production notes (editing cues, chapters)
` : ""}

${deliveryFormats.includes("github-repo") ? `
## GitHub Repository Structure

Create a complete repo structure with:
- Full directory tree (modules/, labs/, projects/, resources/)
- README.md template with course overview, quick start, prerequisites
- SYLLABUS.md structure
- CONTRIBUTING.md for TAs
- Module README template
- Exercise structure (starter/ and solution/)
- .github/ workflows for autograding
- Issue templates for student questions
` : ""}

## Implementation Roadmap

Provide a prioritized checklist for implementing these delivery materials, with estimated effort for each item.`;
}
