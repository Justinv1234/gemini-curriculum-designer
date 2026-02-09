"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCurriculumStore } from "@/lib/store/curriculum-store";
import { generateId } from "@/lib/parsers";
import type { SuggestedModule } from "@/lib/types/curriculum";

export function ModuleListEditor() {
  const {
    suggestedModulesStructured,
    updateSuggestedModule,
    addModule,
    removeModule,
    reorderModules,
  } = useCurriculumStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const modules = suggestedModulesStructured ?? [];

  const handleAdd = () => {
    const newModule: SuggestedModule = {
      id: generateId(),
      name: "New Module",
      description: "",
      estimatedDuration: "1 week",
    };
    addModule(newModule);
    setEditingId(newModule.id);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) reorderModules(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < modules.length - 1) reorderModules(index, index + 1);
  };

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No modules suggested yet.</p>
        <Button onClick={handleAdd} variant="outline" className="mt-3">
          + Add Module
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((mod, index) => (
        <Card key={mod.id} className="relative">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === modules.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>

              {/* Module number */}
              <span className="text-sm font-semibold text-muted-foreground pt-1.5 min-w-[24px]">
                {index + 1}.
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingId === mod.id ? (
                  <div className="space-y-2">
                    <Input
                      value={mod.name}
                      onChange={(e) =>
                        updateSuggestedModule(mod.id, { name: e.target.value })
                      }
                      placeholder="Module name"
                      className="font-medium"
                    />
                    <Textarea
                      value={mod.description}
                      onChange={(e) =>
                        updateSuggestedModule(mod.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Module description"
                      className="text-sm min-h-[60px]"
                    />
                    <Input
                      value={mod.estimatedDuration}
                      onChange={(e) =>
                        updateSuggestedModule(mod.id, {
                          estimatedDuration: e.target.value,
                        })
                      }
                      placeholder="Estimated duration (e.g., 2 weeks)"
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => setEditingId(mod.id)}
                  >
                    <p className="font-medium text-sm">{mod.name}</p>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {mod.description}
                      </p>
                    )}
                    {mod.estimatedDuration && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Duration: {mod.estimatedDuration}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeModule(mod.id)}
                className="text-muted-foreground hover:text-destructive text-sm px-1"
                aria-label="Remove module"
              >
                ✕
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleAdd} variant="outline" className="w-full">
        + Add Module
      </Button>
    </div>
  );
}
