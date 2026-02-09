"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

interface EditableTabProps {
  content: string;
  onSave: (content: string) => void;
  label: string;
}

export function EditableTab({ content, onSave, label }: EditableTabProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  if (!content) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        No {label.toLowerCase()} content generated yet.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editing) {
              onSave(editText);
            } else {
              setEditText(content);
            }
            setEditing(!editing);
          }}
        >
          {editing ? "Save" : "Edit"}
        </Button>
      </div>

      {editing ? (
        <Textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="min-h-[500px] font-mono text-sm"
        />
      ) : (
        <div className="rounded-lg border p-6 bg-card">
          <MarkdownRenderer content={content} />
        </div>
      )}
    </div>
  );
}
