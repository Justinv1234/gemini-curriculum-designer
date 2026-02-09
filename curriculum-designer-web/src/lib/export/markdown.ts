import JSZip from "jszip";
import type { CurriculumStore } from "@/lib/types/curriculum";

export interface ExportFile {
  name: string;
  content: string;
}

export function buildExportFiles(state: CurriculumStore): ExportFile[] {
  if (state.mode === "enhance") {
    return buildEnhanceExportFiles(state);
  }
  return buildCreateExportFiles(state);
}

function buildCreateExportFiles(state: CurriculumStore): ExportFile[] {
  const files: ExportFile[] = [];
  const topic = state.courseInfo?.topic ?? "curriculum";

  // Curriculum document (all modules combined)
  const moduleContents = state.modules
    .filter((m) => m.content)
    .map((m) => m.content)
    .join("\n\n---\n\n");

  if (moduleContents) {
    const header = `# ${topic} - Curriculum\n\n`;
    files.push({
      name: "curriculum.md",
      content: header + moduleContents,
    });
  }

  // Topic landscape / research
  if (state.topicLandscape) {
    files.push({
      name: "resources.md",
      content: `# ${topic} - Topic Landscape & Resources\n\n${state.topicLandscape}`,
    });
  }

  // Assessments
  if (state.assessmentsContent) {
    files.push({
      name: "assessments.md",
      content: `# ${topic} - Assessments\n\n${state.assessmentsContent}`,
    });
  }

  // Delivery plan
  if (state.deliveryContent) {
    files.push({
      name: "delivery-plan.md",
      content: `# ${topic} - Delivery Plan\n\n${state.deliveryContent}`,
    });
  }

  return files;
}

function buildEnhanceExportFiles(state: CurriculumStore): ExportFile[] {
  const files: ExportFile[] = [];
  const courseName = state.analysisReportStructured?.courseName ?? "curriculum";

  // Analysis report
  if (state.analysisReportRaw) {
    files.push({
      name: "analysis-report.md",
      content: `# ${courseName} - Analysis Report\n\n${state.analysisReportRaw}`,
    });
  }

  // What's New research
  if (state.whatsNewContent) {
    files.push({
      name: "whats-new.md",
      content: `# ${courseName} - What's New\n\n${state.whatsNewContent}`,
    });
  }

  // Approved changes only
  const approvedChanges = state.changes.filter((c) => c.status === "approved");
  if (approvedChanges.length > 0) {
    const changesContent = approvedChanges
      .map((c) => {
        let section = `## ${c.title}\n\n`;
        if (c.before) {
          section += `### Before\n${c.before}\n\n### After\n`;
        }
        section += c.after;
        return section;
      })
      .join("\n\n---\n\n");

    files.push({
      name: "changes.md",
      content: `# ${courseName} - Applied Changes\n\n${changesContent}`,
    });
  }

  // Changelog
  if (state.changelog.length > 0) {
    const changelogContent = state.changelog
      .map((entry) => `- **[${entry.category}]** ${entry.description} (${entry.date})`)
      .join("\n");

    files.push({
      name: "changelog.md",
      content: `# ${courseName} - Changelog\n\n${changelogContent}`,
    });
  }

  return files;
}

export async function createMarkdownZip(
  files: ExportFile[]
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("curriculum");

  for (const file of files) {
    folder?.file(file.name, file.content);
  }

  return zip.generateAsync({ type: "blob" });
}
