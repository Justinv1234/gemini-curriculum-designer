"use client";

import type { ExportFile } from "./markdown";

export async function createPdfFromMarkdown(
  files: ExportFile[]
): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default;
  const JSZip = (await import("jszip")).default;

  const zip = new JSZip();
  const folder = zip.folder("curriculum-pdf");

  for (const file of files) {
    const htmlContent = markdownToSimpleHtml(file.content);
    const styledHtml = wrapInHtmlDoc(htmlContent, file.name);

    // Create an isolated container that won't inherit page oklch/lab CSS
    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute;left:-9999px;top:0;width:800px;background:#fff;color:#1a1a1a;font-family:system-ui,sans-serif;";
    container.innerHTML = styledHtml;
    document.body.appendChild(container);

    try {
      const pdfBlob: Blob = await html2pdf()
        .set({
          margin: [15, 15, 15, 15],
          filename: file.name.replace(".md", ".pdf"),
          html2canvas: {
            scale: 2,
            useCORS: true,
            // Force a white background to avoid inheriting oklch colors
            backgroundColor: "#ffffff",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .outputPdf("blob");

      folder?.file(file.name.replace(".md", ".pdf"), pdfBlob);
    } finally {
      document.body.removeChild(container);
    }
  }

  return zip.generateAsync({ type: "blob" });
}

function markdownToSimpleHtml(md: string): string {
  let html = md;

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Code blocks
  html = html.replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>");

  // Tables (basic)
  html = html.replace(
    /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g,
    (_match, header, body) => {
      const headers = header
        .split("|")
        .filter(Boolean)
        .map((h: string) => `<th>${h.trim()}</th>`)
        .join("");
      const rows = body
        .trim()
        .split("\n")
        .map((row: string) => {
          const cells = row
            .split("|")
            .filter(Boolean)
            .map((c: string) => `<td>${c.trim()}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    }
  );

  // Paragraphs (wrap remaining text)
  html = html.replace(/^(?!<[hluotp]|<li|<pre|<table)(.+)$/gm, "<p>$1</p>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");

  return html;
}

function wrapInHtmlDoc(content: string, _title: string): string {
  // Use ONLY hex/rgb colors — NO oklch/lab/lch which html2canvas can't parse
  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 800px; background: #ffffff;">
      <style>
        * { color: #1a1a1a !important; background-color: transparent !important; }
        h1 { font-size: 24px; border-bottom: 2px solid #333333; padding-bottom: 8px; margin-top: 24px; color: #1a1a1a !important; }
        h2 { font-size: 20px; color: #2563eb !important; margin-top: 20px; }
        h3 { font-size: 16px; color: #4b5563 !important; margin-top: 16px; }
        pre { background-color: #f3f4f6 !important; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
        code { background-color: #f3f4f6 !important; padding: 2px 4px; border-radius: 3px; font-size: 13px; color: #1a1a1a !important; }
        pre code { background-color: transparent !important; padding: 0; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
        th { background-color: #f9fafb !important; font-weight: 600; }
        li { margin: 4px 0; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
        strong { color: #1a1a1a !important; }
        em { color: #4b5563 !important; }
        p { color: #1a1a1a !important; }
      </style>
      ${content}
    </div>`;
}
