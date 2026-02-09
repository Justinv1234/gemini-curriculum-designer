"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TopicLandscape } from "@/lib/types/curriculum";

interface TopicLandscapeViewProps {
  landscape: TopicLandscape;
}

export function TopicLandscapeView({ landscape }: TopicLandscapeViewProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["trends", "tools", "resources", "industry"]}
      className="space-y-3"
    >
      {/* Trends */}
      <AccordionItem value="trends" className="border rounded-lg px-4">
        <AccordionTrigger className="text-base font-semibold">
          Current Trends ({landscape.trends.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {landscape.trends.map((trend) => (
              <Card key={trend.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="font-medium text-sm">{trend.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {trend.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Tools & Technologies */}
      <AccordionItem value="tools" className="border rounded-lg px-4">
        <AccordionTrigger className="text-base font-semibold">
          Essential Tools & Technologies ({landscape.tools.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {landscape.tools.map((tool) => (
              <Card key={tool.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{tool.name}</p>
                    {tool.category && (
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Resources */}
      <AccordionItem value="resources" className="border rounded-lg px-4">
        <AccordionTrigger className="text-base font-semibold">
          Recommended Resources ({landscape.resources.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {landscape.resources.map((resource) => (
              <Card key={resource.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{resource.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resource.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Industry Context */}
      {landscape.industryContext && (
        <AccordionItem value="industry" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold">
            Industry Context
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {landscape.industryContext.split("\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
