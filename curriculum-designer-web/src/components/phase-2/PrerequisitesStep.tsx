"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateId } from "@/lib/parsers";
import type { Prerequisite, PrerequisiteStatus } from "@/lib/types/curriculum";
import { cn } from "@/lib/utils";

interface PrerequisitesStepProps {
  prerequisites: Prerequisite[];
  onChange: (prereqs: Prerequisite[]) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const statusConfig: Record<
  PrerequisiteStatus,
  { label: string; color: string; icon: string }
> = {
  include: {
    label: "Include",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: "✅",
  },
  recap: {
    label: "Recap",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "🔄",
  },
  skip: {
    label: "Skip",
    color: "bg-gray-100 text-gray-600 border-gray-300",
    icon: "⏭️",
  },
};

const statusCycle: PrerequisiteStatus[] = ["include", "recap", "skip"];

export function PrerequisitesStep({
  prerequisites,
  onChange,
  onConfirm,
  isLoading,
}: PrerequisitesStepProps) {
  const [newName, setNewName] = useState("");

  const toggleStatus = (id: string) => {
    onChange(
      prerequisites.map((p) => {
        if (p.id !== id) return p;
        const currentIdx = statusCycle.indexOf(p.status);
        const nextStatus = statusCycle[(currentIdx + 1) % statusCycle.length];
        return { ...p, status: nextStatus };
      })
    );
  };

  const handleRemove = (id: string) => {
    onChange(prerequisites.filter((p) => p.id !== id));
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    onChange([
      ...prerequisites,
      {
        id: generateId(),
        name: newName.trim(),
        description: "",
        status: "include",
      },
    ]);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-1">Step 1: Prerequisites</h3>
        <p className="text-sm text-muted-foreground">
          Click the status badge to cycle between Include (teach it), Recap
          (quick review), or Skip (audience knows it).
        </p>
      </div>

      <div className="space-y-2">
        {prerequisites.map((prereq) => {
          const config = statusConfig[prereq.status];
          return (
            <Card
              key={prereq.id}
              className={cn(
                "transition-opacity",
                prereq.status === "skip" && "opacity-60"
              )}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <button
                  onClick={() => toggleStatus(prereq.id)}
                  className="shrink-0"
                  title={`Status: ${config.label}. Click to change.`}
                >
                  <Badge
                    variant="outline"
                    className={cn("cursor-pointer select-none", config.color)}
                  >
                    {config.icon} {config.label}
                  </Badge>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{prereq.name}</p>
                  {prereq.description && (
                    <p className="text-xs text-muted-foreground">
                      {prereq.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(prereq.id)}
                  className="text-muted-foreground hover:text-destructive text-sm px-1 shrink-0"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add new prerequisite */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a prerequisite..."
          className="text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button variant="outline" size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>

      <Button onClick={onConfirm} disabled={isLoading}>
        Confirm Prerequisites
      </Button>
    </div>
  );
}
