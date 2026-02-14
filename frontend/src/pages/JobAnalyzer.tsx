import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  TrendingUp,
  Target,
  Lightbulb,
  FileText,
  ArrowRight
} from "lucide-react";
import { mockResumes } from "@/data/mockData";
import { Resume, ExperienceItem } from "@/types";
import { toast } from "sonner";

interface Suggestion {
  type: "match" | "missing" | "improvement";
  category: string;
  message: string;
  priority: "high" | "medium" | "low";
}

interface AnalysisResult {
  matchScore: number;
  suggestions: Suggestion[];
  matchedSkills: string[];
  missingSkills: string[];
  keywordMatches: { keyword: string; found: boolean }[];
}

// Common tech keywords and their variations
const skillMappings: Record<string, string[]> = {
  "react": ["react", "reactjs", "react.js"],
  "typescript": ["typescript", "ts"],
  "javascript": ["javascript", "js", "ecmascript"],
  "python": ["python", "py"],
  "node": ["node", "nodejs", "node.js"],
  "aws": ["aws", "amazon web services"],
  "docker": ["docker", "containerization", "containers"],
  "kubernetes": ["kubernetes", "k8s"],
  "sql": ["sql", "mysql", "postgresql", "postgres"],
  "agile": ["agile", "scrum", "kanban"],
  "git": ["git", "github", "gitlab", "version control"],
  "api": ["api", "rest", "restful", "graphql"],
  "testing": ["testing", "unit test", "jest", "cypress", "testing"],
  "ci/cd": ["ci/cd", "ci cd", "continuous integration", "continuous deployment", "jenkins", "github actions"],
};

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\W+/);
  const keywords = new Set<string>();
  
  // Extract multi-word phrases too
  const phrases = text.toLowerCase().match(/[\w\.\+\#]+(?:\s+[\w\.\+\#]+){0,2}/g) || [];
  
  [...words, ...phrases].forEach(word => {
    if (word.length > 2) {
      keywords.add(word.trim());
    }
  });
  
  return Array.from(keywords);
}

function analyzeJobDescription(resume: Resume, jobDescription: string): AnalysisResult {
  const jobKeywords = extractKeywords(jobDescription);
  const skills = (resume.sections.find(s => s.type === 'skills')?.content as string[]) || [];
  const experience = (resume.sections.find(s => s.type === 'experience')?.content as ExperienceItem[]) || [];
  const summary = (resume.sections.find(s => s.type === 'summary')?.content as string) || '';
  
  // Combine all resume text for matching
  const resumeText = [
    ...skills,
    ...experience.flatMap(e => [e.position, e.description, ...e.highlights]),
    summary
  ].join(' ').toLowerCase();

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const suggestions: Suggestion[] = [];

  // Check for skill matches
  const importantKeywords = jobKeywords.filter(kw => {
    // Check if this keyword or its variations exist in skill mappings
    for (const [skill, variations] of Object.entries(skillMappings)) {
      if (variations.some(v => kw.includes(v) || v.includes(kw))) {
        return true;
      }
    }
    // Also include common tech terms
    return kw.length > 3 && /^[a-z]+$/.test(kw);
  });

  const techKeywords = jobKeywords.filter(kw => {
    for (const [, variations] of Object.entries(skillMappings)) {
      if (variations.some(v => kw.includes(v))) return true;
    }
    return false;
  });

  techKeywords.forEach(keyword => {
    const found = skills.some(skill => 
      skill.toLowerCase().includes(keyword) || 
      keyword.includes(skill.toLowerCase())
    );
    
    if (found) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  });

  // Generate suggestions
  if (missingSkills.length > 0) {
    suggestions.push({
      type: "missing",
      category: "Skills Gap",
      message: `Consider adding these skills if you have them: ${missingSkills.slice(0, 5).join(", ")}`,
      priority: "high"
    });
  }

  // Check for years of experience mentions
  const yearsMatch = jobDescription.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) {
    suggestions.push({
      type: "improvement",
      category: "Experience",
      message: `The job requires ${yearsMatch[1]}+ years of experience. Make sure your resume clearly shows your relevant experience duration.`,
      priority: "medium"
    });
  }

  // Check for action verbs
  const actionVerbs = ["led", "developed", "implemented", "designed", "managed", "created", "built", "improved", "increased", "reduced"];
  const hasActionVerbs = experience.some(exp => 
    actionVerbs.some(verb => exp.description.toLowerCase().includes(verb) || exp.highlights.some(h => h.toLowerCase().includes(verb)))
  );
  
  if (!hasActionVerbs) {
    suggestions.push({
      type: "improvement",
      category: "Impact Language",
      message: "Use stronger action verbs like 'Led', 'Developed', 'Implemented' to describe your achievements.",
      priority: "medium"
    });
  }

  // Check for quantifiable results
  const hasNumbers = experience.some(exp => 
    /\d+%|\d+x|\$\d+|\d+\s*(users|customers|clients|projects)/i.test(exp.description + exp.highlights.join(' '))
  );
  
  if (!hasNumbers) {
    suggestions.push({
      type: "improvement",
      category: "Quantifiable Results",
      message: "Add metrics and numbers to your experience. E.g., 'Improved performance by 40%' or 'Managed team of 5'.",
      priority: "high"
    });
  }

  // Check for keyword density
  const keywordMatches = importantKeywords.slice(0, 10).map(keyword => ({
    keyword,
    found: resumeText.includes(keyword)
  }));

  const matchCount = keywordMatches.filter(k => k.found).length;
  if (matchCount < keywordMatches.length * 0.5) {
    suggestions.push({
      type: "improvement",
      category: "Keywords",
      message: "Your resume may not pass ATS systems. Try incorporating more keywords from the job description.",
      priority: "high"
    });
  }

  // Success suggestions
  if (matchedSkills.length > 3) {
    suggestions.push({
      type: "match",
      category: "Strong Match",
      message: `Great! Your resume already highlights ${matchedSkills.length} relevant skills for this position.`,
      priority: "low"
    });
  }

  // Calculate match score
  const skillScore = matchedSkills.length / Math.max(matchedSkills.length + missingSkills.length, 1) * 40;
  const keywordScore = matchCount / Math.max(keywordMatches.length, 1) * 30;
  const formatScore = (hasActionVerbs ? 15 : 0) + (hasNumbers ? 15 : 0);
  const matchScore = Math.min(Math.round(skillScore + keywordScore + formatScore), 100);

  return {
    matchScore,
    suggestions: suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    matchedSkills,
    missingSkills: missingSkills.slice(0, 10),
    keywordMatches
  };
}

function getSuggestionIcon(type: Suggestion["type"]) {
  switch (type) {
    case "match":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "missing":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "improvement":
      return <Lightbulb className="h-4 w-4 text-blue-500" />;
  }
}

function getPriorityColor(priority: Suggestion["priority"]) {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
  }
}

export default function JobAnalyzer() {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedResume = mockResumes.find(r => r.id === selectedResumeId);

  const handleAnalyze = () => {
    if (!selectedResume) {
      toast.error("Please select a resume first");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const result = analyzeJobDescription(selectedResume, jobDescription);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      toast.success("Analysis complete!");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Job Description Analyzer</h1>
            <p className="text-muted-foreground mt-1">
              Compare your resume against job requirements and get improvement suggestions
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Target className="h-3 w-3" />
            ATS Optimization
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Select Resume
                </CardTitle>
                <CardDescription>
                  Choose which resume to analyze against the job description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockResumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {resume.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedResume && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{selectedResume.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedResume.sections.length} sections • Last updated {selectedResume.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Job Description
                </CardTitle>
                <CardDescription>
                  Paste the full job description to analyze compatibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js. The ideal candidate should have experience with AWS, Docker, and CI/CD pipelines..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[250px]"
                />
                <p className="text-xs text-muted-foreground">
                  {jobDescription.split(/\s+/).filter(Boolean).length} words
                </p>

                <Button 
                  onClick={handleAnalyze} 
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Analyze Match
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                See how well your resume matches this job
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {analysisResult ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {/* Match Score */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border">
                      <div className="text-5xl font-bold text-primary">
                        {analysisResult.matchScore}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Match Score</p>
                      <Progress value={analysisResult.matchScore} className="mt-4 h-2" />
                    </div>

                    {/* Skills Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Matched Skills ({analysisResult.matchedSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.matchedSkills.length > 0 ? (
                          analysisResult.matchedSkills.map((skill, i) => (
                            <Badge key={i} variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No direct skill matches found</p>
                        )}
                      </div>
                    </div>

                    {analysisResult.missingSkills.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Skills to Consider ({analysisResult.missingSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.missingSkills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="border-orange-500/30 text-orange-600">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Suggestions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Improvement Suggestions</h4>
                      <div className="space-y-3">
                        {analysisResult.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="mt-0.5">{getSuggestionIcon(suggestion.type)}</div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{suggestion.category}</span>
                                <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                                  {suggestion.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keyword Matches */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Keyword Coverage
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {analysisResult.keywordMatches.slice(0, 10).map((kw, i) => (
                          <div 
                            key={i} 
                            className={`flex items-center gap-2 p-2 rounded text-sm ${
                              kw.found ? 'bg-green-500/10' : 'bg-muted'
                            }`}
                          >
                            {kw.found ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className={kw.found ? 'text-green-600' : 'text-muted-foreground'}>
                              {kw.keyword}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/30">
                  <div className="text-center">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Analysis results will appear here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select a resume and paste a job description to begin
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
