import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { Resume, SectionType, ContactInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem, VolunteerItem, PublicationItem, ReferenceItem, AwardItem, CourseItem } from "@/types";
import { cn } from "@/lib/utils";

interface ResumeScoreIndicatorProps {
  resume: Resume;
  onAddSection?: (type: SectionType) => void;
  onClose?: () => void;
}

interface SectionScore {
  type: SectionType;
  name: string;
  score: number;
  maxScore: number;
  status: "complete" | "partial" | "missing";
  tips: string[];
  importance: "essential" | "recommended" | "optional";
}

const sectionImportance: Record<SectionType, "essential" | "recommended" | "optional"> = {
  contact: "essential",
  summary: "essential",
  experience: "essential",
  education: "recommended",
  skills: "essential",
  projects: "recommended",
  certifications: "optional",
  courses: "optional",
  languages: "optional",
  volunteer: "optional",
  publications: "optional",
  references: "optional",
  awards: "optional",
};

const sectionNames: Record<SectionType, string> = {
  contact: "Contact Information",
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  courses: "Courses",
  languages: "Languages",
  volunteer: "Volunteer Experience",
  publications: "Publications",
  references: "References",
  awards: "Awards & Honors",
};

export function ResumeScoreIndicator({ resume, onAddSection, onClose }: ResumeScoreIndicatorProps) {
  const { totalScore, maxScore, sectionScores, missingSections, suggestions } = useMemo(() => {
    const scores: SectionScore[] = [];
    let total = 0;
    let max = 0;

    const existingSectionTypes = resume.sections.map(s => s.type);

    // Analyze each section
    resume.sections.forEach(section => {
      const importance = sectionImportance[section.type];
      const baseScore = importance === "essential" ? 20 : importance === "recommended" ? 10 : 5;
      let sectionScore = 0;
      const tips: string[] = [];

      switch (section.type) {
        case "contact": {
          const contact = section.content as ContactInfo;
          if (contact.fullName) sectionScore += 4;
          else tips.push("Add your full name");
          if (contact.email) sectionScore += 4;
          else tips.push("Add your email address");
          if (contact.phone) sectionScore += 3;
          else tips.push("Add your phone number");
          if (contact.location) sectionScore += 3;
          else tips.push("Add your location");
          if (contact.linkedin) sectionScore += 3;
          else tips.push("Add your LinkedIn profile");
          if (contact.website) sectionScore += 3;
          else tips.push("Consider adding a portfolio website");
          break;
        }
        case "summary": {
          const summary = section.content as string;
          if (summary.length > 0) sectionScore += 10;
          else tips.push("Write a compelling professional summary");
          if (summary.length >= 100) sectionScore += 5;
          else if (summary.length > 0) tips.push("Expand your summary to at least 100 characters");
          if (summary.length >= 200) sectionScore += 5;
          else if (summary.length >= 100) tips.push("Consider a more detailed summary (200+ chars)");
          break;
        }
        case "experience": {
          const experience = section.content as ExperienceItem[];
          if (experience.length > 0) sectionScore += 8;
          else tips.push("Add at least one work experience");
          if (experience.length >= 2) sectionScore += 4;
          else if (experience.length === 1) tips.push("Add more work experiences");
          if (experience.some(e => e.highlights.length > 0)) sectionScore += 4;
          else tips.push("Add achievement highlights to your experiences");
          if (experience.some(e => e.description)) sectionScore += 4;
          else tips.push("Add descriptions to your work experiences");
          break;
        }
        case "education": {
          const education = section.content as EducationItem[];
          if (education.length > 0) sectionScore += 10;
          else tips.push("Add your educational background");
          break;
        }
        case "skills": {
          const skills = section.content as string[];
          if (skills.length > 0) sectionScore += 8;
          else tips.push("Add your key skills");
          if (skills.length >= 5) sectionScore += 6;
          else if (skills.length > 0) tips.push("Add more skills (at least 5 recommended)");
          if (skills.length >= 10) sectionScore += 6;
          else if (skills.length >= 5) tips.push("Consider adding more skills for a stronger profile");
          break;
        }
        case "projects": {
          const projects = section.content as ProjectItem[];
          if (projects.length > 0) sectionScore += 5;
          else tips.push("Showcase your projects");
          if (projects.length >= 2) sectionScore += 5;
          break;
        }
        case "certifications": {
          const certs = section.content as CertificationItem[];
          if (certs.length > 0) sectionScore += 5;
          break;
        }
        case "courses": {
          const courses = section.content as CourseItem[];
          if (courses.length > 0) sectionScore += 5;
          break;
        }
        case "languages": {
          const languages = section.content as LanguageItem[];
          if (languages.length > 0) sectionScore += 5;
          break;
        }
        case "volunteer": {
          const volunteer = section.content as VolunteerItem[];
          if (volunteer.length > 0) sectionScore += 5;
          break;
        }
        case "publications": {
          const pubs = section.content as PublicationItem[];
          if (pubs.length > 0) sectionScore += 5;
          break;
        }
        case "references": {
          const refs = section.content as ReferenceItem[];
          if (refs.length > 0) sectionScore += 5;
          break;
        }
        case "awards": {
          const awards = section.content as AwardItem[];
          if (awards.length > 0) sectionScore += 5;
          break;
        }
      }

      const status: SectionScore["status"] = 
        sectionScore >= baseScore * 0.8 ? "complete" : 
        sectionScore > 0 ? "partial" : "missing";

      scores.push({
        type: section.type,
        name: sectionNames[section.type],
        score: sectionScore,
        maxScore: baseScore,
        status,
        tips,
        importance,
      });

      total += sectionScore;
      max += baseScore;
    });

    // Find missing essential/recommended sections
    const missing: SectionType[] = [];
    (Object.keys(sectionImportance) as SectionType[]).forEach(type => {
      if (!existingSectionTypes.includes(type)) {
        const importance = sectionImportance[type];
        if (importance === "essential" || importance === "recommended") {
          missing.push(type);
        }
      }
    });

    // Add potential score from missing essential sections
    missing.forEach(type => {
      const importance = sectionImportance[type];
      if (importance === "essential") max += 20;
      else if (importance === "recommended") max += 10;
    });

    // Generate top suggestions
    const allSuggestions: string[] = [];
    scores.forEach(s => {
      if (s.importance === "essential" && s.tips.length > 0) {
        allSuggestions.push(...s.tips.slice(0, 2));
      }
    });
    missing.forEach(type => {
      if (sectionImportance[type] === "essential") {
        allSuggestions.push(`Add ${sectionNames[type]} section`);
      }
    });
    scores.forEach(s => {
      if (s.importance === "recommended" && s.tips.length > 0) {
        allSuggestions.push(...s.tips.slice(0, 1));
      }
    });

    return {
      totalScore: total,
      maxScore: max,
      sectionScores: scores,
      missingSections: missing,
      suggestions: allSuggestions.slice(0, 5),
    };
  }, [resume]);

  const percentage = Math.round((totalScore / maxScore) * 100);
  const scoreLevel = percentage >= 80 ? "excellent" : percentage >= 60 ? "good" : percentage >= 40 ? "fair" : "needs-work";

  const scoreColors = {
    excellent: "text-green-500",
    good: "text-blue-500",
    fair: "text-yellow-500",
    "needs-work": "text-red-500",
  };

  const scoreLabels = {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    "needs-work": "Needs Work",
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Resume Score
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score */}
        <div className="text-center">
          <div className={cn("text-5xl font-bold", scoreColors[scoreLevel])}>
            {percentage}%
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge 
              variant="secondary"
              className={cn(
                scoreLevel === "excellent" && "bg-green-500/10 text-green-500",
                scoreLevel === "good" && "bg-blue-500/10 text-blue-500",
                scoreLevel === "fair" && "bg-yellow-500/10 text-yellow-500",
                scoreLevel === "needs-work" && "bg-red-500/10 text-red-500"
              )}
            >
              {scoreLabels[scoreLevel]}
            </Badge>
          </div>
          <Progress value={percentage} className="mt-4 h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {totalScore} / {maxScore} points
          </p>
        </div>

        {/* Section Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Section Scores</h4>
          <TooltipProvider>
            <div className="space-y-2">
              {sectionScores.map((section) => (
                <Tooltip key={section.type}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-help">
                      <div className="flex-shrink-0">
                        {section.status === "complete" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : section.status === "partial" ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {section.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {section.score}/{section.maxScore}
                          </span>
                        </div>
                        <Progress 
                          value={(section.score / section.maxScore) * 100} 
                          className="h-1 mt-1" 
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[250px]">
                    {section.tips.length > 0 ? (
                      <ul className="text-xs space-y-1">
                        {section.tips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs">Section complete! ✓</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Missing Sections */}
        {missingSections.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Suggested Sections</h4>
            <div className="flex flex-wrap gap-2">
              {missingSections.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddSection?.(type)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {sectionNames[type]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Top Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Improvements
            </h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary mt-0.5">→</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
