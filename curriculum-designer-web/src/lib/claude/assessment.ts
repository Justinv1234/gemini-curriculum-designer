import type { CourseInfo, CurriculumModule, AssessmentType } from "@/lib/types/curriculum";

const ASSESSMENT_LABELS: Record<AssessmentType, string> = {
  quizzes: "Quizzes (knowledge checks with answer keys)",
  labs: "Coding/Practical Labs (hands-on skill assessments)",
  projects: "Projects (applied learning with milestones)",
  written: "Written Assignments (analysis/reflection essays)",
  "peer-reviews": "Peer Reviews (collaborative assessment forms)",
  portfolio: "Portfolio Assessment (cumulative demonstration)",
};

export function buildAssessmentPrompt(
  courseInfo: CourseInfo,
  modules: CurriculumModule[],
  assessmentTypes: AssessmentType[]
): string {
  const moduleList = modules
    .map((m, i) => `${i + 1}. ${m.name}`)
    .join("\n");

  const selectedTypes = assessmentTypes
    .map((t) => `- ${ASSESSMENT_LABELS[t]}`)
    .join("\n");

  return `I'm designing assessments for a course on "${courseInfo.topic}" for ${courseInfo.audience} students in a ${courseInfo.format} format.

**Course Modules:**
${moduleList}

**Selected Assessment Types:**
${selectedTypes}

Generate comprehensive assessments for this course. Include ALL of the following for each selected type:

${assessmentTypes.includes("quizzes") ? `
### Quizzes
For each module, create a quiz with:
- Duration and total points
- 3-5 multiple choice questions with answer explanations
- 2-3 short answer questions with expected answers and rubrics
- Include code analysis questions where relevant
` : ""}

${assessmentTypes.includes("labs") ? `
### Practical Labs
Create 2-3 lab assessments that cover multiple modules:
- Clear objectives and prerequisites
- Detailed requirements with point values
- Grading rubric table (Excellent/Good/Satisfactory/Needs Work)
- Starter code descriptions where applicable
` : ""}

${assessmentTypes.includes("projects") ? `
### Projects
Design 1-2 substantial projects:
- Project overview and learning outcomes assessed
- 2-3 milestones with deliverables and check-in questions
- Final submission requirements (code, documentation, reflection, demo)
- Detailed grading rubric for Technical Implementation, Code Quality, Innovation, and Communication
` : ""}

${assessmentTypes.includes("written") ? `
### Written Assignments
Create 2-3 written assignments:
- Analysis or reflection prompts tied to course content
- Word count expectations
- Grading criteria
` : ""}

${assessmentTypes.includes("peer-reviews") ? `
### Peer Review Forms
Create a peer review template with:
- Review checklist (Functionality, Code Quality, Design)
- Sections for Strengths, Areas for Improvement, and Questions
- Rating scale
- Reviewer reflection prompt
` : ""}

${assessmentTypes.includes("portfolio") ? `
### Portfolio Assessment
Define portfolio requirements:
- Required artifacts from each module
- Reflection requirements
- Presentation/demo expectations
- Holistic grading rubric
` : ""}

## Assessment Calendar

Create a timeline table integrating all assessments:

| Week | Module | Assessment | Type | Weight |
|------|--------|------------|------|--------|

Include a grade breakdown summary at the end.`;
}
