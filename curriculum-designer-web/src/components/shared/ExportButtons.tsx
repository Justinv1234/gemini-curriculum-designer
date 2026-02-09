"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { buildExportFiles, createMarkdownZip } from "@/lib/export/markdown";
import { createPdfFromMarkdown } from "@/lib/export/pdf";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportButtons() {
  const store = useCurriculumStore();
  const [exporting, setExporting] = useState<"md" | "pdf" | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const files = buildExportFiles(store);
  const hasContent = files.length > 0;

  const handleMarkdownExport = async () => {
    setExporting("md");
    try {
      const blob = await createMarkdownZip(files);
      downloadBlob(blob, "curriculum-markdown.zip");
    } finally {
      setExporting(null);
    }
  };

  const handlePdfExport = async () => {
    setExporting("pdf");
    setPdfError(null);
    try {
      const blob = await createPdfFromMarkdown(files);
      downloadBlob(blob, "curriculum-pdf.zip");
    } catch (err) {
      console.error("PDF export error:", err);
      setPdfError(
        "PDF export failed. Try downloading Markdown instead."
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <Button
          onClick={handleMarkdownExport}
          disabled={!hasContent || exporting !== null}
          variant="outline"
        >
          {exporting === "md" ? "Exporting..." : "Download Markdown (.zip)"}
        </Button>
        <Button
          onClick={handlePdfExport}
          disabled={!hasContent || exporting !== null}
        >
          {exporting === "pdf" ? "Exporting..." : "Download PDF (.zip)"}
        </Button>
      </div>
      {pdfError && (
        <p className="text-sm text-destructive">{pdfError}</p>
      )}
    </div>
  );
}
