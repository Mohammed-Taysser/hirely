import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lock,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  ArrowRight,
  Eye,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeTemplate } from "@/data/resumeTemplates";

const sectionIcons: Record<string, React.ElementType> = {
  contact: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Code,
  projects: Code,
  certifications: Award,
};

interface TemplatePreviewCardProps {
  template: ResumeTemplate;
  isLocked: boolean;
  onSelect: (template: ResumeTemplate) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (templateId: string) => void;
}

export function TemplatePreviewCard({
  template,
  isLocked,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}: TemplatePreviewCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
          isLocked && "opacity-75"
        )}
      >
        {/* Favorite Button */}
        {onToggleFavorite && !isLocked && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity",
              isFavorite && "opacity-100"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(template.id);
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </Button>
        )}

        {/* Preview Area */}
        <div
          className={cn(
            "h-48 relative flex items-center justify-center",
            template.previewStyle.bodyBg
          )}
        >
          {/* Template Thumbnail */}
          <div
            className={cn(
              "w-32 h-40 rounded-lg shadow-md flex flex-col overflow-hidden transform transition-transform group-hover:scale-105",
              template.previewStyle.bodyBg
            )}
          >
            <div
              className={cn(
                "h-8 flex items-center justify-center",
                template.previewStyle.headerBg
              )}
            >
              <span className="text-lg">{template.thumbnail}</span>
            </div>
            <div className="flex-1 p-2 space-y-1">
              <div
                className="h-2 rounded"
                style={{ backgroundColor: template.accentColor }}
              />
              <div className="h-1.5 w-3/4 bg-muted rounded" />
              <div className="h-1 w-full bg-muted/60 rounded mt-2" />
              <div className="h-1 w-5/6 bg-muted/60 rounded" />
              <div className="h-1 w-4/5 bg-muted/60 rounded" />
            </div>
          </div>

          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  Upgrade to {template.tier.toUpperCase()}
                </p>
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          {!isLocked && (
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button onClick={() => setPreviewOpen(true)} variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={() => onSelect(template)}>
                Use
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
            <Badge
              variant={
                template.tier === "free"
                  ? "secondary"
                  : template.tier === "pro"
                  ? "default"
                  : "outline"
              }
            >
              {template.tier.toUpperCase()}
            </Badge>
          </div>

          {/* Section Icons */}
          <div className="flex gap-2 mt-4">
            {template.sections.slice(0, 5).map((section, idx) => {
              const Icon = sectionIcons[section.type] || FileText;
              return (
                <div
                  key={idx}
                  className="p-1.5 rounded bg-muted"
                  title={section.type}
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              );
            })}
            {template.sections.length > 5 && (
              <div className="p-1.5 rounded bg-muted text-xs text-muted-foreground">
                +{template.sections.length - 5}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{template.thumbnail}</span>
              {template.name}
            </DialogTitle>
            <DialogDescription>{template.description}</DialogDescription>
          </DialogHeader>

          {/* Template Full Preview */}
          <div className="space-y-4 py-4">
            {/* Preview Container */}
            <div
              className={cn(
                "rounded-xl overflow-hidden border shadow-lg",
                template.previewStyle.bodyBg
              )}
            >
              {/* Header Section */}
              <div
                className={cn("p-8", template.previewStyle.headerBg)}
              >
                <div className="text-center">
                  <h2
                    className={cn(
                      "text-2xl font-bold",
                      template.previewStyle.headerText
                    )}
                  >
                    John Doe
                  </h2>
                  <p
                    className={cn(
                      "text-sm mt-1 opacity-90",
                      template.previewStyle.headerText
                    )}
                  >
                    Software Engineer
                  </p>
                  <div
                    className={cn(
                      "flex items-center justify-center gap-4 mt-3 text-sm opacity-80",
                      template.previewStyle.headerText
                    )}
                  >
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      john@example.com
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      +1 (555) 123-4567
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      San Francisco, CA
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Sections */}
              <div className="p-8 space-y-6">
                {/* Summary */}
                {template.sections.some((s) => s.type === "summary") && (
                  <div>
                    <h3
                      className="text-sm font-semibold uppercase tracking-wide mb-2"
                      style={{ color: template.accentColor }}
                    >
                      Professional Summary
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Passionate software engineer with 5+ years of experience
                      building scalable web applications. Expertise in React,
                      TypeScript, and cloud technologies.
                    </p>
                  </div>
                )}

                {/* Experience */}
                {template.sections.some((s) => s.type === "experience") && (
                  <div>
                    <h3
                      className="text-sm font-semibold uppercase tracking-wide mb-3"
                      style={{ color: template.accentColor }}
                    >
                      Work Experience
                    </h3>
                    <div
                      className="border-l-2 pl-4"
                      style={{ borderColor: `${template.accentColor}50` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Senior Developer</h4>
                          <p className="text-sm text-muted-foreground">
                            Tech Company Inc.
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          2020 — Present
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Led development of key features and mentored junior
                        developers.
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {template.sections.some((s) => s.type === "skills") && (
                  <div>
                    <h3
                      className="text-sm font-semibold uppercase tracking-wide mb-2"
                      style={{ color: template.accentColor }}
                    >
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"].map(
                        (skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-xs rounded-md"
                            style={{
                              backgroundColor: `${template.accentColor}15`,
                              color: template.accentColor,
                            }}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {template.sections.some((s) => s.type === "education") && (
                  <div>
                    <h3
                      className="text-sm font-semibold uppercase tracking-wide mb-3"
                      style={{ color: template.accentColor }}
                    >
                      Education
                    </h3>
                    <div
                      className="border-l-2 pl-4"
                      style={{ borderColor: `${template.accentColor}50` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            B.S. in Computer Science
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            State University
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          2016 — 2020
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Template Info */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Sections Included</p>
                <div className="flex flex-wrap gap-1">
                  {template.sections.map((section, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {section.type}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={() => onSelect(template)}>
                Use This Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
