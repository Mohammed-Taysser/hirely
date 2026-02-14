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
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  Copy,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Resume, ContactInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types";

interface AIJobMatcherProps {
  resume: Resume;
}

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  keywordDensity: number;
}

const extractSkillsFromJobDescription = (text: string): string[] => {
  const commonSkills = [
    // Programming
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin",
    "react", "angular", "vue", "node.js", "nodejs", "express", "django", "flask", "spring", "rails",
    "html", "css", "sass", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "git", "ci/cd", "jenkins", "github actions",
    "rest", "graphql", "api", "microservices",
    "agile", "scrum", "kanban",
    // Data
    "machine learning", "ml", "ai", "artificial intelligence", "data science", "analytics",
    "tableau", "power bi", "excel", "r", "pandas", "numpy", "tensorflow", "pytorch",
    // Design
    "figma", "sketch", "adobe", "photoshop", "illustrator", "ui", "ux", "design",
    // Soft skills
    "leadership", "management", "communication", "teamwork", "problem solving", "analytical",
    // Business
    "project management", "pmp", "product management", "stakeholder", "budget", "strategy",
    "marketing", "seo", "sem", "crm", "salesforce", "hubspot",
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = commonSkills.filter(skill => lowerText.includes(skill));
  
  // Also extract skills that appear capitalized (like proper nouns/tech names)
  const techPatterns = text.match(/\b[A-Z][a-zA-Z]+(?:\.[a-zA-Z]+)?\b/g) || [];
  const filteredTechPatterns = techPatterns
    .filter(t => t.length > 2 && !["The", "And", "For", "With", "Our", "You", "This", "That", "About"].includes(t))
    .map(t => t.toLowerCase());

  return [...new Set([...foundSkills, ...filteredTechPatterns])];
};

const extractResumeSkills = (resume: Resume): string[] => {
  const skills: string[] = [];
  
  resume.sections.forEach(section => {
    if (section.type === "skills" && Array.isArray(section.content)) {
      skills.push(...(section.content as string[]).map(s => s.toLowerCase()));
    }
    if (section.type === "experience" && Array.isArray(section.content)) {
      (section.content as ExperienceItem[]).forEach(exp => {
        const text = `${exp.description} ${exp.highlights.join(" ")}`.toLowerCase();
        skills.push(...extractSkillsFromJobDescription(text));
      });
    }
    if (section.type === "projects" && Array.isArray(section.content)) {
      (section.content as ProjectItem[]).forEach(proj => {
        skills.push(...proj.technologies.map(t => t.toLowerCase()));
      });
    }
  });
  
  return [...new Set(skills)];
};

const analyzeMatch = (resume: Resume, jobDescription: string): MatchResult => {
  const jobSkills = extractSkillsFromJobDescription(jobDescription);
  const resumeSkills = extractResumeSkills(resume);
  
  const matchedSkills = jobSkills.filter(skill => 
    resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
  );
  
  const missingSkills = jobSkills.filter(skill => 
    !resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
  );
  
  const score = jobSkills.length > 0 
    ? Math.round((matchedSkills.length / jobSkills.length) * 100) 
    : 0;
  
  // Calculate keyword density
  const resumeText = JSON.stringify(resume).toLowerCase();
  const jobKeywords = jobDescription.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const matchedKeywords = jobKeywords.filter(k => resumeText.includes(k));
  const keywordDensity = jobKeywords.length > 0 
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100) 
    : 0;
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (missingSkills.length > 0) {
    suggestions.push(`Add these skills to your resume if you have them: ${missingSkills.slice(0, 5).join(", ")}`);
  }
  
  if (score < 50) {
    suggestions.push("Consider tailoring your experience descriptions to include more relevant keywords from the job posting");
  }
  
  if (keywordDensity < 30) {
    suggestions.push("Mirror the language used in the job description to improve ATS compatibility");
  }
  
  const summarySection = resume.sections.find(s => s.type === "summary");
  if (summarySection && typeof summarySection.content === "string" && summarySection.content.length < 50) {
    suggestions.push("Expand your professional summary to include key terms from the job description");
  }
  
  if (score >= 70) {
    suggestions.push("Your resume is a strong match! Focus on quantifying your achievements with specific metrics");
  }
  
  return {
    score,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    suggestions,
    keywordDensity,
  };
};

export function AIJobMatcher({ resume }: AIJobMatcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const matchResult = analyzeMatch(resume, jobDescription);
    setResult(matchResult);
    setIsAnalyzing(false);
  };

  const handleCopyMissingSkills = () => {
    if (result?.missingSkills.length) {
      navigator.clipboard.writeText(result.missingSkills.join(", "));
      toast.success("Skills copied to clipboard");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Target className="h-4 w-4" />
          Job Match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Job Match Analyzer
          </DialogTitle>
          <DialogDescription>
            Paste a job description to see how well your resume matches and get improvement suggestions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {!result ? (
            <>
              <div>
                <Textarea
                  placeholder="Paste the full job description here..."
                  className="min-h-[200px] resize-none"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: Include the full job posting for better analysis
                </p>
              </div>
              
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
                    <Target className="mr-2 h-4 w-4" />
                    Analyze Match
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Score Card */}
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Match Score</p>
                      <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Keyword Density</p>
                      <p className={`text-2xl font-semibold ${getScoreColor(result.keywordDensity)}`}>
                        {result.keywordDensity}%
                      </p>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${getProgressColor(result.score)}`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Matched Skills */}
              {result.matchedSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <h4 className="font-medium text-sm">Matched Skills ({result.matchedSkills.length})</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills.slice(0, 15).map((skill) => (
                      <Badge key={skill} variant="secondary" className="capitalize">
                        {skill}
                      </Badge>
                    ))}
                    {result.matchedSkills.length > 15 && (
                      <Badge variant="outline">+{result.matchedSkills.length - 15} more</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {result.missingSkills.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <h4 className="font-medium text-sm">Missing Skills ({result.missingSkills.length})</h4>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCopyMissingSkills}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.slice(0, 10).map((skill) => (
                      <Badge key={skill} variant="outline" className="capitalize border-red-200 text-red-600">
                        {skill}
                      </Badge>
                    ))}
                    {result.missingSkills.length > 10 && (
                      <Badge variant="outline">+{result.missingSkills.length - 10} more</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <h4 className="font-medium text-sm">Improvement Suggestions</h4>
                  </div>
                  <div className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResult(null);
                  setJobDescription("");
                }}
              >
                Analyze Another Job
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
