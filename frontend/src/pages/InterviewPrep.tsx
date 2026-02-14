import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageSquare, Lightbulb, Target, User, Briefcase, Code, ChevronDown, ChevronUp, Copy, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InterviewQuestion {
  id: string;
  category: "behavioral" | "technical" | "situational" | "role-specific";
  question: string;
  tip: string;
}

const categoryMeta = {
  behavioral: { icon: User, label: "Behavioral", color: "text-blue-500", description: "Past experience and soft skills" },
  technical: { icon: Code, label: "Technical", color: "text-purple-500", description: "Technical knowledge and problem-solving" },
  situational: { icon: Lightbulb, label: "Situational", color: "text-amber-500", description: "Hypothetical workplace scenarios" },
  "role-specific": { icon: Target, label: "Role-Specific", color: "text-green-500", description: "Targeted to the job description" },
};

function generateQuestions(role: string, skills: string, experience: string, jobDescription: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  let qId = 0;
  const add = (category: InterviewQuestion["category"], question: string, tip: string) => {
    questions.push({ id: `q-${qId++}`, category, question, tip });
  };

  // Behavioral
  add("behavioral", "Tell me about yourself and your professional background.",
    "Structure: Present → Past → Future. Keep it under 2 minutes.");
  add("behavioral", "Describe a time you overcame a significant challenge at work.",
    "Use STAR method: Situation, Task, Action, Result. Quantify the result.");
  add("behavioral", "Tell me about a time you had a conflict with a coworker. How did you resolve it?",
    "Focus on communication, empathy, and the positive outcome.");
  add("behavioral", "What is your greatest professional weakness?",
    "Pick a real weakness, then show concrete steps you're taking to improve.");

  if (experience) {
    add("behavioral", `Walk me through the most impactful project from your experience as ${experience}.`,
      "Highlight your specific contributions and measurable outcomes.");
  }

  if (/lead|manage|direct|senior/i.test(role + " " + experience)) {
    add("behavioral", "How do you motivate a team during a high-pressure deadline?",
      "Discuss delegation, communication, and how you maintain morale.");
  }

  // Technical
  if (skills) {
    const skillList = skills.split(",").map(s => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      add("technical", `Explain your proficiency with ${skillList.slice(0, 3).join(", ")}.`,
        "Rate yourself honestly and give project examples for each.");
    }
    if (skillList.some(s => /react|angular|vue|next|frontend/i.test(s))) {
      add("technical", "How do you approach component architecture and state management?",
        "Discuss patterns like composition, context, and when to use global vs local state.");
    }
    if (skillList.some(s => /python|java|node|backend|api/i.test(s))) {
      add("technical", "Describe your approach to designing a scalable API.",
        "Cover REST/GraphQL, authentication, rate limiting, and error handling.");
    }
    if (skillList.some(s => /sql|database|postgres|mongo/i.test(s))) {
      add("technical", "How do you optimize slow database queries?",
        "Mention indexing, query plans, caching, and denormalization trade-offs.");
    }
    if (skillList.some(s => /aws|cloud|docker|kubernetes|devops/i.test(s))) {
      add("technical", "Walk me through a deployment pipeline you've built or maintained.",
        "Cover CI/CD, testing stages, monitoring, and rollback strategies.");
    }
  }

  add("technical", "How do you stay current with technology trends?",
    "Mention specific resources, communities, and recent learnings.");

  // Situational
  add("situational", "If you received conflicting priorities from two managers, what would you do?",
    "Show communication skills and ability to escalate diplomatically.");
  add("situational", "How would you handle a production incident at 2 AM?",
    "Describe your incident response process: triage, communicate, fix, postmortem.");
  add("situational", "If given a project with an impossible deadline, what's your approach?",
    "Demonstrate scope negotiation, MVP thinking, and stakeholder communication.");

  // Role-specific
  if (jobDescription.trim()) {
    const jdLower = jobDescription.toLowerCase();
    if (/lead|manager|director/i.test(jdLower)) {
      add("role-specific", "How do you approach hiring and building a high-performing team?",
        "Discuss your evaluation criteria, onboarding process, and retention strategies.");
    }
    if (/agile|scrum|sprint/i.test(jdLower)) {
      add("role-specific", "How do you contribute to agile ceremonies and continuous improvement?",
        "Give examples of process improvements you've driven.");
    }
    if (/startup|fast-paced|growth/i.test(jdLower)) {
      add("role-specific", "How do you thrive in an ambiguous, fast-changing environment?",
        "Share examples of wearing multiple hats and adapting quickly.");
    }
    if (/remote|hybrid|distributed/i.test(jdLower)) {
      add("role-specific", "How do you maintain productivity and communication remotely?",
        "Mention async communication, documentation habits, and tooling.");
    }
    const requirementPatterns = jobDescription.match(/(?:experience with|proficiency in|knowledge of)\s+([^,.;]+)/gi);
    if (requirementPatterns?.length) {
      const req = requirementPatterns[0].replace(/^(experience with|proficiency in|knowledge of)\s+/i, "").trim();
      add("role-specific", `Can you walk us through your hands-on experience with ${req}?`,
        "Prepare a specific project example demonstrating deep expertise.");
    }
    add("role-specific", "Why are you interested in this role and company?",
      "Research the company's mission, recent news, and connect your goals to their needs.");
  }

  if (role) {
    add("role-specific", `What makes you the best candidate for the ${role} position?`,
      "Align your unique strengths with the role's top 3 requirements.");
  }

  return questions;
}

export default function InterviewPrep() {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("behavioral");

  const questions = useMemo(
    () => generateQuestions(role, skills, experience, jobDescription),
    [role, skills, experience, jobDescription]
  );

  const grouped = useMemo(() => {
    const map: Record<string, InterviewQuestion[]> = {};
    for (const q of questions) (map[q.category] ??= []).push(q);
    return map;
  }, [questions]);

  const copyAll = () => {
    const text = questions.map((q, i) =>
      `${i + 1}. [${q.category.toUpperCase()}] ${q.question}\n   💡 ${q.tip}`
    ).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("All questions copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8" />
            Interview Preparation
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate tailored interview questions based on your profile and target role.
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Input
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Key Skills (comma-separated)</Label>
                <Input
                  placeholder="e.g. React, TypeScript, Node.js, AWS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Experience Summary</Label>
              <Input
                placeholder="e.g. 5 years as a full-stack developer at tech startups"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Description (optional — generates role-specific questions)</Label>
              <Textarea
                placeholder="Paste the job posting here for targeted questions..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{questions.length}</span> questions generated
          </p>
          <Button variant="outline" size="sm" onClick={copyAll}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Copy All
          </Button>
        </div>

        <div className="space-y-3">
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
                    <div className="text-left">
                      <span className="font-medium">{meta.label}</span>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs ml-2">{items.length}</Badge>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 space-y-4">
                    {items.map((q, idx) => (
                      <div key={q.id} className="border-l-2 border-muted pl-4 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{idx + 1}. {q.question}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(q.question);
                              toast.success("Question copied");
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                          <span>{q.tip}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
