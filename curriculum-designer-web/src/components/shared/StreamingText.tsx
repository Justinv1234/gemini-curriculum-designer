"use client";

import { MarkdownRenderer } from "./MarkdownRenderer";

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
}

export function StreamingText({ content, isStreaming }: StreamingTextProps) {
  if (!content && !isStreaming) return null;

  return (
    <div className="relative">
      <MarkdownRenderer content={content} />
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
      )}
    </div>
  );
}
