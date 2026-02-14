import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  X, 
  GitCompare, 
  Plus, 
  Minus, 
  Equal,
  ArrowLeftRight,
} from "lucide-react";
import { Resume, ResumeSection, ContactInfo, ExperienceItem, EducationItem, ProjectItem } from "@/types";
import { ResumeVersion } from "@/hooks/useResumeHistory";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface VersionComparisonProps {
  versions: ResumeVersion[];
  currentVersionIndex: number;
  onClose: () => void;
}

interface DiffResult {
  type: "added" | "removed" | "modified" | "unchanged";
  sectionType: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

function getSectionSummary(section: ResumeSection): string {
  switch (section.type) {
    case "contact": {
      const contact = section.content as ContactInfo;
      return contact.fullName || "No name";
    }
    case "summary":
      return ((section.content as string) || "").slice(0, 50) + "...";
    case "experience": {
      const items = section.content as ExperienceItem[];
      return `${items.length} position(s)`;
    }
    case "education": {
      const items = section.content as EducationItem[];
      return `${items.length} degree(s)`;
    }
    case "skills": {
      const skills = section.content as string[];
      return `${skills.length} skill(s)`;
    }
    case "projects": {
      const items = section.content as ProjectItem[];
      return `${items.length} project(s)`;
    }
    default:
      if (Array.isArray(section.content)) {
        return `${section.content.length} item(s)`;
      }
      return typeof section.content === "string" 
        ? section.content.slice(0, 30) + "..." 
        : "Content";
  }
}

function compareResumes(oldResume: Resume, newResume: Resume): DiffResult[] {
  const diffs: DiffResult[] = [];
  
  // Compare title
  if (oldResume.title !== newResume.title) {
    diffs.push({
      type: "modified",
      sectionType: "Title",
      field: "title",
      oldValue: oldResume.title,
      newValue: newResume.title,
    });
  }

  // Create section maps
  const oldSections = new Map(oldResume.sections.map(s => [s.id, s]));
  const newSections = new Map(newResume.sections.map(s => [s.id, s]));

  // Check for removed sections
  oldResume.sections.forEach(section => {
    if (!newSections.has(section.id)) {
      diffs.push({
        type: "removed",
        sectionType: section.title,
        oldValue: getSectionSummary(section),
      });
    }
  });

  // Check for added sections
  newResume.sections.forEach(section => {
    if (!oldSections.has(section.id)) {
      diffs.push({
        type: "added",
        sectionType: section.title,
        newValue: getSectionSummary(section),
      });
    }
  });

  // Check for modified sections
  newResume.sections.forEach(newSection => {
    const oldSection = oldSections.get(newSection.id);
    if (oldSection) {
      const oldJson = JSON.stringify(oldSection.content);
      const newJson = JSON.stringify(newSection.content);
      
      if (oldJson !== newJson) {
        diffs.push({
          type: "modified",
          sectionType: newSection.title,
          oldValue: getSectionSummary(oldSection),
          newValue: getSectionSummary(newSection),
        });
      } else if (oldSection.order !== newSection.order) {
        diffs.push({
          type: "modified",
          sectionType: newSection.title,
          field: "order",
          oldValue: `Position ${oldSection.order + 1}`,
          newValue: `Position ${newSection.order + 1}`,
        });
      }
    }
  });

  return diffs;
}

export function VersionComparison({ 
  versions, 
  currentVersionIndex,
  onClose 
}: VersionComparisonProps) {
  const [leftVersionId, setLeftVersionId] = useState<string>(
    versions[Math.max(0, currentVersionIndex - 1)]?.id || versions[0]?.id
  );
  const [rightVersionId, setRightVersionId] = useState<string>(
    versions[currentVersionIndex]?.id
  );

  const leftVersion = versions.find(v => v.id === leftVersionId);
  const rightVersion = versions.find(v => v.id === rightVersionId);

  const diffs = useMemo(() => {
    if (!leftVersion || !rightVersion) return [];
    return compareResumes(leftVersion.resume, rightVersion.resume);
  }, [leftVersion, rightVersion]);

  const swapVersions = () => {
    setLeftVersionId(rightVersionId);
    setRightVersionId(leftVersionId);
  };

  const getDiffIcon = (type: DiffResult["type"]) => {
    switch (type) {
      case "added":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "removed":
        return <Minus className="h-4 w-4 text-red-500" />;
      case "modified":
        return <GitCompare className="h-4 w-4 text-yellow-500" />;
      default:
        return <Equal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDiffBadge = (type: DiffResult["type"]) => {
    const variants: Record<string, string> = {
      added: "bg-green-500/10 text-green-500 border-green-500/20",
      removed: "bg-red-500/10 text-red-500 border-red-500/20",
      modified: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      unchanged: "bg-muted text-muted-foreground",
    };
    return variants[type] || variants.unchanged;
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Version Comparison
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version Selectors */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              Compare From
            </label>
            <Select value={leftVersionId} onValueChange={setLeftVersionId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version, index) => (
                  <SelectItem key={version.id} value={version.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span>{version.label || format(new Date(version.timestamp), "MMM d, HH:mm")}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={swapVersions}
            className="mt-5"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              Compare To
            </label>
            <Select value={rightVersionId} onValueChange={setRightVersionId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version, index) => (
                  <SelectItem key={version.id} value={version.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span>{version.label || format(new Date(version.timestamp), "MMM d, HH:mm")}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Diff Summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3 text-green-500" />
            <span>{diffs.filter(d => d.type === "added").length} added</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-red-500" />
            <span>{diffs.filter(d => d.type === "removed").length} removed</span>
          </div>
          <div className="flex items-center gap-1">
            <GitCompare className="h-3 w-3 text-yellow-500" />
            <span>{diffs.filter(d => d.type === "modified").length} modified</span>
          </div>
        </div>

        {/* Diff List */}
        <ScrollArea className="h-[300px]">
          {diffs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Equal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No differences between these versions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {diffs.map((diff, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    diff.type === "added" && "bg-green-500/5 border-green-500/20",
                    diff.type === "removed" && "bg-red-500/5 border-red-500/20",
                    diff.type === "modified" && "bg-yellow-500/5 border-yellow-500/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getDiffIcon(diff.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{diff.sectionType}</span>
                        {diff.field && (
                          <span className="text-xs text-muted-foreground">
                            ({diff.field})
                          </span>
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getDiffBadge(diff.type))}
                        >
                          {diff.type}
                        </Badge>
                      </div>
                      
                      {diff.type === "modified" && (
                        <div className="mt-2 text-sm space-y-1">
                          {diff.oldValue && (
                            <div className="flex items-start gap-2">
                              <span className="text-red-500 font-mono">-</span>
                              <span className="text-muted-foreground line-through">
                                {diff.oldValue}
                              </span>
                            </div>
                          )}
                          {diff.newValue && (
                            <div className="flex items-start gap-2">
                              <span className="text-green-500 font-mono">+</span>
                              <span>{diff.newValue}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {diff.type === "added" && diff.newValue && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {diff.newValue}
                        </p>
                      )}
                      
                      {diff.type === "removed" && diff.oldValue && (
                        <p className="text-sm text-muted-foreground mt-1 line-through">
                          {diff.oldValue}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
