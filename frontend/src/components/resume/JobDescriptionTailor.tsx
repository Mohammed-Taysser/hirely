import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wand2,
  Loader2,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Resume, ContactInfo, ExperienceItem, EducationItem, ProjectItem } from "@/types";

interface JobDescriptionTailorProps {
  resume: Resume;
  onApplyChanges: (updatedResume: Resume) => void;
}

interface TailorSuggestion {
  id: string;
  type: "add_skill" | "rewrite_summary" | "add_keyword" | "enhance_experience";
  label: string;
  description: string;
  value: string;
  selected: boolean;
}

const extractKeywords = (text: string): string[] => {
  const commonSkills = [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "spring",
    "html", "css", "sass", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd",
    "git", "github", "gitlab", "jenkins",
    "rest", "graphql", "api", "microservices",
    "agile", "scrum", "kanban", "jira",
    "machine learning", "deep learning", "ai", "data science", "analytics",
    "figma", "sketch", "adobe", "photoshop", "ui/ux",
    "leadership", "management", "communication", "collaboration", "problem solving",
    "project management", "product management", "stakeholder management",
    "testing", "jest", "cypress", "selenium", "qa",
    "linux", "devops", "networking", "security",
    "salesforce", "hubspot", "crm", "seo", "marketing",
  ];

  const lower = text.toLowerCase();
  const found = commonSkills.filter(s => lower.includes(s));

  // Extract capitalized tech terms
  const techTerms = text.match(/\b[A-Z][a-zA-Z.+#]+(?:\s[A-Z][a-zA-Z.+#]+)?\b/g) || [];
  const filtered = techTerms
    .filter(t => t.length > 2 && !["The", "And", "For", "With", "Our", "You", "This", "That", "About", "We", "Are", "Job", "Role", "Team", "Work", "Must", "Will", "Can"].includes(t))
    .map(t => t.toLowerCase());

  return [...new Set([...found, ...filtered])];
};

const getResumeSkills = (resume: Resume): string[] => {
  const skills: string[] = [];
  resume.sections.forEach(s => {
    if (s.type === "skills" && Array.isArray(s.content)) {
      skills.push(...(s.content as string[]).map(sk => sk.toLowerCase()));
    }
    if (s.type === "projects" && Array.isArray(s.content)) {
      (s.content as ProjectItem[]).forEach(p => skills.push(...p.technologies.map(t => t.toLowerCase())));
    }
  });
  return [...new Set(skills)];
};

const generateSuggestions = (resume: Resume, jobDescription: string): TailorSuggestion[] => {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeSkills = getResumeSkills(resume);
  const suggestions: TailorSuggestion[] = [];
  let id = 0;

  // Suggest missing skills to add
  const missingSkills = jobKeywords.filter(k => !resumeSkills.some(rs => rs.includes(k) || k.includes(rs)));
  missingSkills.slice(0, 8).forEach(skill => {
    suggestions.push({
      id: `skill-${id++}`,
      type: "add_skill",
      label: `Add "${skill}" to Skills`,
      description: "This keyword appears in the job description but is missing from your resume.",
      value: skill.charAt(0).toUpperCase() + skill.slice(1),
      selected: true,
    });
  });

  // Suggest summary rewrite
  const summarySection = resume.sections.find(s => s.type === "summary");
  const currentSummary = (summarySection?.content as string) || "";
  const topKeywords = jobKeywords.slice(0, 5);

  if (topKeywords.length > 0) {
    // Extract role/title from job description
    const firstLine = jobDescription.split("\n")[0]?.trim() || "";
    const roleMatch = firstLine.match(/(?:seeking|looking for|hiring)?\s*(?:a\s+)?(.+?)(?:\s+to\s+|\s+who\s+|\s+with\s+|$)/i);
    const roleName = roleMatch?.[1]?.replace(/^(senior|junior|lead|staff|principal)\s*/i, "$1 ").trim() || "professional";

    const newSummary = currentSummary
      ? `${currentSummary.replace(/\.$/, "")}. Experienced with ${topKeywords.slice(0, 3).join(", ")}, and passionate about delivering results in ${topKeywords[3] || "dynamic environments"}.`
      : `Results-driven ${roleName} with expertise in ${topKeywords.slice(0, 3).join(", ")}. Passionate about building high-quality solutions and contributing to team success in ${topKeywords[3] || "fast-paced environments"}.`;

    suggestions.push({
      id: `summary-${id++}`,
      type: "rewrite_summary",
      label: "Enhance summary with job keywords",
      description: `Weave keywords (${topKeywords.slice(0, 3).join(", ")}) into your professional summary for better ATS matching.`,
      value: newSummary,
      selected: true,
    });
  }

  // Suggest experience bullet improvements
  const expSection = resume.sections.find(s => s.type === "experience");
  if (expSection && Array.isArray(expSection.content)) {
    const experiences = expSection.content as ExperienceItem[];
    if (experiences.length > 0 && topKeywords.length > 0) {
      const actionVerbs = ["Spearheaded", "Implemented", "Optimized", "Developed", "Architected", "Led", "Delivered", "Streamlined"];
      const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
      const keyword = topKeywords[0];

      suggestions.push({
        id: `exp-${id++}`,
        type: "enhance_experience",
        label: "Add targeted bullet to latest experience",
        description: `Add a highlight to "${experiences[0].position}" that incorporates job-relevant keywords.`,
        value: `${verb} ${keyword}-focused initiatives resulting in improved efficiency and team productivity`,
        selected: false,
      });
    }
  }

  return suggestions;
};

export function JobDescriptionTailor({ resume, onApplyChanges }: JobDescriptionTailorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<TailorSuggestion[]>([]);
  const [step, setStep] = useState<"input" | "review">("input");

  const selectedCount = suggestions.filter(s => s.selected).length;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const results = generateSuggestions(resume, jobDescription);
    setSuggestions(results);
    setStep("review");
    setIsAnalyzing(false);
  };

  const toggleSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleApply = () => {
    const selected = suggestions.filter(s => s.selected);
    if (selected.length === 0) {
      toast.error("Select at least one suggestion to apply");
      return;
    }

    let updated = { ...resume, sections: resume.sections.map(s => ({ ...s })), updatedAt: new Date() };

    // Apply skill additions
    const skillsToAdd = selected.filter(s => s.type === "add_skill").map(s => s.value);
    if (skillsToAdd.length > 0) {
      const skillsSection = updated.sections.find(s => s.type === "skills");
      if (skillsSection) {
        const currentSkills = (skillsSection.content as string[]) || [];
        skillsSection.content = [...currentSkills, ...skillsToAdd];
      }
    }

    // Apply summary rewrite
    const summaryChange = selected.find(s => s.type === "rewrite_summary");
    if (summaryChange) {
      const summarySection = updated.sections.find(s => s.type === "summary");
      if (summarySection) {
        summarySection.content = summaryChange.value;
      }
    }

    // Apply experience enhancement
    const expChange = selected.find(s => s.type === "enhance_experience");
    if (expChange) {
      const expSection = updated.sections.find(s => s.type === "experience");
      if (expSection && Array.isArray(expSection.content)) {
        const experiences = [...(expSection.content as ExperienceItem[])];
        if (experiences.length > 0) {
          experiences[0] = {
            ...experiences[0],
            highlights: [...experiences[0].highlights, expChange.value],
          };
          expSection.content = experiences;
        }
      }
    }

    onApplyChanges(updated);
    toast.success(`Applied ${selected.length} tailoring suggestions`);
    setIsOpen(false);
    setStep("input");
    setSuggestions([]);
    setJobDescription("");
  };

  const handleReset = () => {
    setStep("input");
    setSuggestions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) { setStep("input"); setSuggestions([]); }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Tailor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Tailor Resume to Job Description
          </DialogTitle>
          <DialogDescription>
            {step === "input"
              ? "Paste a job description and we'll suggest changes to optimize your resume."
              : `${suggestions.length} suggestions found — select which to apply.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === "input" ? (
            <div className="space-y-4">
              <Textarea
                placeholder="Paste the full job description here..."
                className="min-h-[220px] resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The more complete the job description, the better the tailoring suggestions.
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobDescription.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Tailoring Suggestions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="flex gap-3">
                <Card className="flex-1">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{suggestions.length}</p>
                    <p className="text-xs text-muted-foreground">Suggestions</p>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedCount}</p>
                    <p className="text-xs text-muted-foreground">Selected</p>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {suggestions.filter(s => s.type === "add_skill").length}
                    </p>
                    <p className="text-xs text-muted-foreground">New Skills</p>
                  </CardContent>
                </Card>
              </div>

              <ScrollArea className="max-h-[350px]">
                <div className="space-y-3 pr-2">
                  {suggestions.map((suggestion) => (
                    <Card
                      key={suggestion.id}
                      className={`cursor-pointer transition-colors ${
                        suggestion.selected ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleSuggestion(suggestion.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={suggestion.selected}
                            onCheckedChange={() => toggleSuggestion(suggestion.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {suggestion.type === "add_skill" && <PlusCircle className="h-3.5 w-3.5 text-green-500" />}
                              {suggestion.type === "rewrite_summary" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                              {suggestion.type === "enhance_experience" && <ArrowRight className="h-3.5 w-3.5 text-blue-500" />}
                              <span className="font-medium text-sm">{suggestion.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                            {suggestion.type !== "add_skill" && (
                              <p className="text-xs mt-1 p-2 rounded bg-muted/50 line-clamp-3 italic">
                                {suggestion.value}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Your resume already matches well!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Start Over
                </Button>
                <Button onClick={handleApply} disabled={selectedCount === 0} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply {selectedCount} Change{selectedCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
