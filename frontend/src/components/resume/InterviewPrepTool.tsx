import { useState, useMemo } from "react";
import { Resume, ContactInfo, ExperienceItem, EducationItem, ProjectItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { MessageSquare, Lightbulb, Target, User, Briefcase, Code, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InterviewPrepToolProps {
  resume: Resume;
}

interface InterviewQuestion {
  id: string;
  category: "behavioral" | "technical" | "situational" | "role-specific";
  question: string;
  tip: string;
  source: string;
}

const categoryMeta = {
  behavioral: { icon: User, label: "Behavioral", color: "text-blue-500" },
  technical: { icon: Code, label: "Technical", color: "text-purple-500" },
  situational: { icon: Lightbulb, label: "Situational", color: "text-amber-500" },
  "role-specific": { icon: Target, label: "Role-Specific", color: "text-green-500" },
};

function generateQuestions(resume: Resume, jobDescription: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  const sections = resume.sections;
  const contact = sections.find(s => s.type === "contact")?.content as ContactInfo | undefined;
  const experience = sections.find(s => s.type === "experience")?.content as ExperienceItem[] | undefined;
  const skills = sections.find(s => s.type === "skills")?.content as string[] | undefined;
  const projects = sections.find(s => s.type === "projects")?.content as ProjectItem[] | undefined;
  const education = sections.find(s => s.type === "education")?.content as EducationItem[] | undefined;
  const summary = sections.find(s => s.type === "summary")?.content as string | undefined;

  let qId = 0;
  const add = (category: InterviewQuestion["category"], question: string, tip: string, source: string) => {
    questions.push({ id: `q-${qId++}`, category, question, tip, source });
  };

  // --- BEHAVIORAL (from experience) ---
  add("behavioral", "Tell me about yourself and your professional background.",
    "Structure with Present → Past → Future. Summarize your current role, key achievements, and what you're looking for.",
    summary ? "Based on your summary" : "Standard opener");

  if (experience?.length) {
    const latest = experience[0];
    add("behavioral", `Describe a key achievement during your time at ${latest.company}.`,
      "Use the STAR method: Situation, Task, Action, Result. Quantify impact where possible.",
      `From your ${latest.position} role`);

    if (experience.length > 1) {
      add("behavioral", "Why did you transition between your roles? What drove each career move?",
        "Frame each transition positively — growth, new challenges, expanding skills.",
        `You have ${experience.length} roles listed`);
    }

    const hasLeadership = experience.some(e =>
      /lead|manage|direct|oversee|mentor|supervise/i.test(e.position + " " + e.description)
    );
    if (hasLeadership) {
      add("behavioral", "Tell me about a time you led a team through a difficult challenge.",
        "Emphasize communication, delegation, and how you supported team members.",
        "Leadership keywords detected in experience");
    }

    const hasMetrics = experience.some(e =>
      /\d+%|\$[\d,]+|\d+ (people|clients|users|projects)/i.test(e.description + " " + e.highlights.join(" "))
    );
    if (hasMetrics) {
      add("behavioral", "Walk me through a project where you delivered measurable results.",
        "Lead with the metric, then explain the context. Numbers make your answers memorable.",
        "Quantified achievements in your resume");
    }
  }

  add("behavioral", "What is your greatest professional weakness and how are you addressing it?",
    "Choose a genuine area for improvement, then show concrete steps you're taking to grow.",
    "Standard behavioral question");

  // --- TECHNICAL (from skills) ---
  if (skills?.length) {
    const topSkills = skills.slice(0, 5);
    add("technical", `How would you rate your proficiency in ${topSkills.slice(0, 3).join(", ")}?`,
      "Be honest about levels. Give examples of projects where you used each skill.",
      "From your skills section");

    if (skills.some(s => /react|angular|vue|next/i.test(s))) {
      add("technical", "Explain your approach to state management in frontend applications.",
        "Discuss trade-offs between different solutions and when you'd choose each.",
        "Frontend framework detected in skills");
    }
    if (skills.some(s => /python|java|node|golang|rust/i.test(s))) {
      add("technical", "Describe how you approach debugging a complex backend issue.",
        "Walk through your systematic process: reproduce, isolate, diagnose, fix, verify.",
        "Backend language detected in skills");
    }
    if (skills.some(s => /sql|database|postgres|mongo|redis/i.test(s))) {
      add("technical", "How do you optimize database queries for performance?",
        "Mention indexing, query analysis, caching strategies, and denormalization trade-offs.",
        "Database skills detected");
    }
    if (skills.some(s => /aws|azure|gcp|cloud|docker|kubernetes/i.test(s))) {
      add("technical", "Describe your experience with cloud architecture and deployment.",
        "Discuss scalability, cost optimization, and reliability patterns you've implemented.",
        "Cloud/DevOps skills detected");
    }
  }

  // --- SITUATIONAL ---
  add("situational", "How would you handle a disagreement with a teammate about a technical approach?",
    "Show respect for different perspectives. Focus on data-driven decisions and compromise.",
    "Collaboration assessment");

  add("situational", "If given a tight deadline with unclear requirements, what would you do?",
    "Demonstrate prioritization: clarify scope, identify MVP, communicate trade-offs early.",
    "Time management assessment");

  if (projects?.length) {
    add("situational", `If you had to rebuild ${projects[0].name} from scratch, what would you do differently?`,
      "Show growth and learning. Discuss architectural decisions and lessons learned.",
      `From your ${projects[0].name} project`);
  }

  // --- ROLE-SPECIFIC (from job description) ---
  if (jobDescription.trim()) {
    const jdLower = jobDescription.toLowerCase();

    if (/lead|manager|director|head of/i.test(jdLower)) {
      add("role-specific", "How do you approach building and scaling a high-performing team?",
        "Discuss hiring, mentoring, setting expectations, and creating psychological safety.",
        "Leadership role detected in JD");
    }
    if (/agile|scrum|sprint|kanban/i.test(jdLower)) {
      add("role-specific", "Describe your experience with agile methodologies and how you contribute to sprint processes.",
        "Give specific examples of ceremonies you've participated in and improvements you've driven.",
        "Agile methodology mentioned in JD");
    }
    if (/startup|fast-paced|growth/i.test(jdLower)) {
      add("role-specific", "How do you thrive in a fast-paced, ambiguous environment?",
        "Share examples of wearing multiple hats, rapid iteration, and adapting to change.",
        "Startup/growth environment in JD");
    }
    if (/remote|hybrid|distributed/i.test(jdLower)) {
      add("role-specific", "How do you stay productive and communicate effectively in a remote setting?",
        "Mention tools, async communication habits, and proactive over-communication.",
        "Remote/hybrid work mentioned in JD");
    }

    // Extract key requirements and generate questions
    const requirementPatterns = jobDescription.match(/(?:experience with|proficiency in|knowledge of|familiar with)\s+([^,.;]+)/gi);
    if (requirementPatterns?.length) {
      const requirement = requirementPatterns[0].replace(/^(experience with|proficiency in|knowledge of|familiar with)\s+/i, "").trim();
      add("role-specific", `Can you walk us through your experience with ${requirement}?`,
        "Prepare a specific project example that demonstrates hands-on expertise.",
        "Key requirement from job description");
    }

    add("role-specific", "Why are you interested in this particular role and company?",
      "Research the company's mission, recent news, and culture. Connect your goals to their needs.",
      "Standard role-fit question");
  }

  return questions;
}

export function InterviewPrepTool({ resume }: InterviewPrepToolProps) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("behavioral");

  const questions = useMemo(() => generateQuestions(resume, jobDescription), [resume, jobDescription]);

  const grouped = useMemo(() => {
    const map: Record<string, InterviewQuestion[]> = {};
    for (const q of questions) {
      (map[q.category] ??= []).push(q);
    }
    return map;
  }, [questions]);

  const copyAllQuestions = () => {
    const text = questions.map((q, i) => `${i + 1}. [${q.category.toUpperCase()}] ${q.question}\n   💡 Tip: ${q.tip}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("All questions copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Interview Prep
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Preparation
          </DialogTitle>
          <DialogDescription>
            Practice questions generated from your resume and target job description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{questions.length}</span> questions generated based on your resume
            </p>
            <Button variant="outline" size="sm" onClick={copyAllQuestions}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy All
            </Button>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label>Paste Job Description (optional — generates role-specific questions)</Label>
            <Textarea
              placeholder="Paste the job posting here for targeted interview questions..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          {/* Questions by Category */}
          <div className="space-y-2">
            {(Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).map(cat => {
              const meta = categoryMeta[cat];
              const items = grouped[cat] || [];
              if (!items.length) return null;
              const isExpanded = expandedCategory === cat;

              return (
                <Card key={cat} className="overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  >
                    <div className="flex items-center gap-3">
                      <meta.icon className={cn("h-5 w-5", meta.color)} />
                      <span className="font-medium">{meta.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {items.length}
                      </Badge>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 space-y-4">
                      {items.map(q => (
                        <div key={q.id} className="border-l-2 border-muted pl-4 space-y-1">
                          <p className="text-sm font-medium">{q.question}</p>
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                            <span>{q.tip}</span>
                          </div>
                          <p className="text-xs text-muted-foreground/60 italic">{q.source}</p>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
