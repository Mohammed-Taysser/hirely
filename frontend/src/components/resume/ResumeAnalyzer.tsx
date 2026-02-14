import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { Resume, ContactInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types";

interface Suggestion {
  type: "success" | "warning" | "info";
  category: string;
  message: string;
}

interface ResumeAnalyzerProps {
  resume: Resume;
  onClose: () => void;
}

const analyzeResume = (resume: Resume): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  
  // Analyze contact section
  const contactSection = resume.sections.find(s => s.type === "contact");
  if (contactSection) {
    const contact = contactSection.content as ContactInfo;
    if (!contact.email) {
      suggestions.push({ type: "warning", category: "Contact", message: "Add an email address - it's essential for recruiters to reach you." });
    }
    if (!contact.phone) {
      suggestions.push({ type: "info", category: "Contact", message: "Consider adding a phone number for faster communication." });
    }
    if (!contact.linkedin) {
      suggestions.push({ type: "info", category: "Contact", message: "Add your LinkedIn profile to strengthen your professional presence." });
    }
    if (contact.email && contact.phone && contact.linkedin) {
      suggestions.push({ type: "success", category: "Contact", message: "Great! Your contact information is complete." });
    }
  }

  // Analyze summary section
  const summarySection = resume.sections.find(s => s.type === "summary");
  if (summarySection) {
    const summary = summarySection.content as string;
    const wordCount = summary.split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) {
      suggestions.push({ type: "warning", category: "Summary", message: "Your summary is too short. Aim for 50-150 words to effectively showcase your value." });
    } else if (wordCount > 200) {
      suggestions.push({ type: "warning", category: "Summary", message: "Your summary is too long. Keep it under 150 words for better readability." });
    } else if (wordCount >= 50 && wordCount <= 150) {
      suggestions.push({ type: "success", category: "Summary", message: "Your summary length is ideal!" });
    }
  } else {
    suggestions.push({ type: "warning", category: "Summary", message: "Add a professional summary to introduce yourself to recruiters." });
  }

  // Analyze experience section
  const experienceSection = resume.sections.find(s => s.type === "experience");
  if (experienceSection) {
    const experiences = experienceSection.content as ExperienceItem[];
    if (experiences.length === 0) {
      suggestions.push({ type: "warning", category: "Experience", message: "Add your work experience to demonstrate your professional background." });
    } else {
      // Check for action verbs
      const actionVerbs = ["led", "managed", "developed", "created", "implemented", "designed", "increased", "reduced", "achieved", "delivered", "built", "launched", "improved", "optimized"];
      let hasActionVerbs = false;
      let hasQuantifiableResults = false;
      
      experiences.forEach(exp => {
        const descLower = exp.description.toLowerCase();
        if (actionVerbs.some(verb => descLower.includes(verb))) {
          hasActionVerbs = true;
        }
        if (/\d+%|\$\d+|\d+\s*(users|customers|clients|projects|team)/i.test(exp.description)) {
          hasQuantifiableResults = true;
        }
      });

      if (!hasActionVerbs) {
        suggestions.push({ type: "info", category: "Experience", message: "Use strong action verbs (led, developed, achieved) to make your accomplishments stand out." });
      } else {
        suggestions.push({ type: "success", category: "Experience", message: "Good use of action verbs in your experience descriptions!" });
      }

      if (!hasQuantifiableResults) {
        suggestions.push({ type: "info", category: "Experience", message: "Add quantifiable results (e.g., 'increased sales by 25%') to demonstrate your impact." });
      } else {
        suggestions.push({ type: "success", category: "Experience", message: "Great job including quantifiable achievements!" });
      }

      if (experiences.length >= 3) {
        suggestions.push({ type: "success", category: "Experience", message: `You have ${experiences.length} experience entries - solid work history!` });
      }
    }
  }

  // Analyze skills section
  const skillsSection = resume.sections.find(s => s.type === "skills");
  if (skillsSection) {
    const skills = skillsSection.content as string[];
    if (skills.length < 5) {
      suggestions.push({ type: "warning", category: "Skills", message: "Add more skills. Aim for 8-15 relevant skills to match job requirements." });
    } else if (skills.length >= 8 && skills.length <= 15) {
      suggestions.push({ type: "success", category: "Skills", message: "Your skills section has a good number of entries!" });
    } else if (skills.length > 20) {
      suggestions.push({ type: "info", category: "Skills", message: "Consider focusing on your top 15 most relevant skills." });
    }
  } else {
    suggestions.push({ type: "warning", category: "Skills", message: "Add a skills section to highlight your technical and soft skills." });
  }

  // Analyze education section
  const educationSection = resume.sections.find(s => s.type === "education");
  if (educationSection) {
    const education = educationSection.content as EducationItem[];
    if (education.length > 0) {
      suggestions.push({ type: "success", category: "Education", message: "Education section is present - good foundation!" });
    }
  }

  // Analyze projects section
  const projectsSection = resume.sections.find(s => s.type === "projects");
  if (projectsSection) {
    const projects = projectsSection.content as ProjectItem[];
    if (projects.length > 0) {
      const hasLinks = projects.some(p => p.link);
      if (!hasLinks) {
        suggestions.push({ type: "info", category: "Projects", message: "Add links to your projects so recruiters can see your work firsthand." });
      } else {
        suggestions.push({ type: "success", category: "Projects", message: "Great! Your projects include links for easy access." });
      }
    }
  }

  // Analyze certifications
  const certsSection = resume.sections.find(s => s.type === "certifications");
  if (certsSection) {
    const certs = certsSection.content as CertificationItem[];
    if (certs.length > 0) {
      suggestions.push({ type: "success", category: "Certifications", message: `You have ${certs.length} certification(s) - shows commitment to professional growth!` });
    }
  }

  // Overall section count
  const activeSections = resume.sections.filter(s => {
    if (s.type === "contact") return true;
    if (s.type === "summary") return (s.content as string).length > 0;
    if (Array.isArray(s.content)) return (s.content as any[]).length > 0;
    return false;
  });

  if (activeSections.length >= 5) {
    suggestions.push({ type: "success", category: "Overall", message: "Your resume has good section coverage!" });
  } else if (activeSections.length < 3) {
    suggestions.push({ type: "warning", category: "Overall", message: "Add more sections to create a comprehensive resume." });
  }

  return suggestions;
};

const getIcon = (type: Suggestion["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getBadgeVariant = (type: Suggestion["type"]) => {
  switch (type) {
    case "success":
      return "default";
    case "warning":
      return "destructive";
    case "info":
      return "secondary";
  }
};

export const ResumeAnalyzer = ({ resume, onClose }: ResumeAnalyzerProps) => {
  const [suggestions] = useState<Suggestion[]>(() => analyzeResume(resume));

  const successCount = suggestions.filter(s => s.type === "success").length;
  const warningCount = suggestions.filter(s => s.type === "warning").length;
  const infoCount = suggestions.filter(s => s.type === "info").length;

  const score = Math.round((successCount / (successCount + warningCount + infoCount * 0.5)) * 100) || 0;

  return (
    <Card className="border-primary/20 bg-card/95 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Resume Analysis
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Resume Score</p>
            <p className="text-3xl font-bold text-primary">{score}%</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{successCount} good</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>{warningCount} to fix</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              <span>{infoCount} tips</span>
            </div>
          </div>
        </div>

        <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3"
            >
              {getIcon(suggestion.type)}
              <div className="flex-1 space-y-1">
                <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
                  {suggestion.category}
                </Badge>
                <p className="text-sm text-foreground">{suggestion.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
