"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { generateId } from "@/lib/parsers";

const MAX_FILE_SIZE = 200 * 1024; // 200KB
const ACCEPTED_EXTENSIONS = [".md", ".txt", ".pdf", ".docx"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function FileUpload() {
  const { uploadedFiles, addUploadedFile, removeUploadedFile } =
    useCurriculumStore();
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `"${file.name}" exceeds the 200KB limit (${formatFileSize(file.size)}). Try a smaller file.`
        );
        return;
      }

      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError(
          `"${file.name}" is not supported. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}. For .pptx, export as PDF first.`
        );
        return;
      }

      // Text files: read client-side
      if (ext === ".md" || ext === ".txt") {
        const content = await file.text();
        addUploadedFile({
          id: generateId(),
          name: file.name,
          content,
        });
        return;
      }

      // PDF/DOCX: extract server-side
      setExtracting(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/enhance/extract-text", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Extraction failed");
        }

        const data = await response.json();
        addUploadedFile({
          id: generateId(),
          name: file.name,
          content: data.text,
        });
      } catch (err) {
        setError(
          `Failed to extract text from "${file.name}": ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setExtracting(false);
      }
    },
    [addUploadedFile]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach(processFile);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-4">
      <Card
        className="border-2 border-dashed cursor-pointer transition-colors hover:border-primary"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <CardContent className="py-10 text-center">
          <div className="text-4xl mb-3">&#x1F4C1;</div>
          <p className="font-medium mb-1">
            {extracting ? "Extracting text..." : "Drop files here or click to browse"}
          </p>
          <p className="text-sm text-muted-foreground">
            Accepts .md, .txt, .pdf, .docx (max 200KB each)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Have a .pptx? Export it as PDF first.
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".md,.txt,.pdf,.docx"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Uploaded Files ({uploadedFiles.length})
          </p>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-lg border px-4 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">&#x1F4C4;</span>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.content.length)} of text
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUploadedFile(file.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
