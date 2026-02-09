"use client";

import { useState, useCallback } from "react";

export function useStreaming() {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const stream = useCallback(
    async (url: string, body: unknown): Promise<string> => {
      setIsStreaming(true);
      setContent("");

      let fullContent = "";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullContent += parsed.text;
                  setContent(fullContent);
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                if (e instanceof Error && e.message !== "Stream error") {
                  // Skip JSON parse errors from partial chunks
                }
              }
            }
          }
        }
      } finally {
        setIsStreaming(false);
      }

      return fullContent;
    },
    []
  );

  return { content, isStreaming, stream, setContent };
}
