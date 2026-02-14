import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resumeTemplates, ResumeTemplate } from "@/data/resumeTemplates";
import { Lock, Check, FileText, Briefcase, GraduationCap, Code, Award, User, Heart, BookOpen, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: ResumeTemplate) => void;
  currentTier?: "free" | "pro" | "premium";
}

const tierOrder: Record<string, number> = { free: 0, pro: 1, premium: 2 };

const sectionIcons: Record<string, React.ElementType> = {
  contact: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Code,
  projects: Code,
  certifications: Award,
  courses: BookOpen,
  languages: Languages,
  volunteer: Heart,
  publications: BookOpen,
};

export function TemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate,
  currentTier = "free",
}: TemplateSelectorProps) {
  const canAccessTemplate = (templateTier: string) => {
    return tierOrder[currentTier] >= tierOrder[templateTier];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Choose a Template
          </DialogTitle>
          <p className="text-muted-foreground">
            Select a template to start with. You can customize it after.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto py-4 pr-2">
          {resumeTemplates.map((template) => {
            const isLocked = !canAccessTemplate(template.tier);

            return (
              <Card
                key={template.id}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2",
                  isLocked && "opacity-60",
                  !isLocked && "hover:border-primary/50"
                )}
                onClick={() => {
                  if (!isLocked) {
                    onSelectTemplate(template);
                    onOpenChange(false);
                  }
                }}
              >
                {/* Template Preview Card */}
                <div className={cn("relative overflow-hidden rounded-t-sm")}>
                  {/* Mini Resume Preview */}
                  <div className={cn("h-44 flex flex-col", template.previewStyle.bodyBg)}>
                    {/* Header Section */}
                    <div className={cn("px-3 py-2.5", template.previewStyle.headerBg)}>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">{template.thumbnail}</div>
                        <div className={template.previewStyle.headerText}>
                          <div className="h-2.5 w-20 bg-current opacity-80 rounded-full mb-1" />
                          <div className="h-1.5 w-14 bg-current opacity-50 rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Sections */}
                    <div className="flex-1 p-3 space-y-2.5">
                      {template.sections.slice(1, 4).map((section, idx) => {
                        const Icon = sectionIcons[section.type] || FileText;
                        return (
                          <div key={idx} className="flex items-start gap-2">
                            <div className={cn(
                              "w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5",
                              template.previewStyle.headerBg.includes("gradient") 
                                ? template.previewStyle.headerBg 
                                : "bg-muted"
                            )}>
                              <Icon className={cn(
                                "h-2.5 w-2.5",
                                template.previewStyle.headerBg.includes("gradient") 
                                  ? "text-white" 
                                  : "text-muted-foreground"
                              )} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="h-1.5 bg-foreground/20 rounded-full w-16" />
                              <div className="h-1 bg-foreground/10 rounded-full w-full" />
                              <div className="h-1 bg-foreground/10 rounded-full w-3/4" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tier Badge Overlay */}
                  {template.tier !== "free" && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={template.tier === "premium" ? "default" : "secondary"}
                        className={cn(
                          "text-[10px] px-2 py-0.5 font-semibold shadow-md",
                          template.tier === "premium" && "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
                          template.tier === "pro" && "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                        )}
                      >
                        {template.tier.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4 border-t border-border/50">
                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    {template.sections.slice(0, 5).map((section, idx) => {
                      const Icon = sectionIcons[section.type] || FileText;
                      return (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-md bg-muted flex items-center justify-center"
                          title={section.type}
                        >
                          <Icon className="h-3 w-3 text-muted-foreground" />
                        </div>
                      );
                    })}
                    {template.sections.length > 5 && (
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        +{template.sections.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Upgrade to {template.tier}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlock premium templates
                      </p>
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
                    <Button 
                      size="sm" 
                      className="shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Use Template
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
