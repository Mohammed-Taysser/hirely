import { useState, useMemo, useCallback } from "react";
import { Resume, ResumeSection, ContactInfo, ExperienceItem, EducationItem, SectionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Type,
  Search,
  Layout,
  ChevronDown,
  ChevronUp,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ATSScoreCheckerProps {
  resume: Resume;
  onFixIssues?: (updatedResume: Resume) => void;
}

interface ATSCheck {
  id: string;
  category: "formatting" | "content" | "keywords" | "compatibility";
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  weight: number;
}

const categoryMeta = {
  formatting: { icon: Type, label: "Formatting", color: "text-blue-500" },
  content: { icon: Layout, label: "Content", color: "text-purple-500" },
  keywords: { icon: Search, label: "Keywords", color: "text-amber-500" },
  compatibility: { icon: FileCheck, label: "File Compatibility", color: "text-green-500" },
};

function runATSChecks(resume: Resume, jobDescription: string): ATSCheck[] {
  const checks: ATSCheck[] = [];
  const sections = resume.sections;
  const contact = sections.find(s => s.type === "contact")?.content as ContactInfo | undefined;
  const summary = sections.find(s => s.type === "summary")?.content as string | undefined;
  const experience = sections.find(s => s.type === "experience")?.content as ExperienceItem[] | undefined;
  const education = sections.find(s => s.type === "education")?.content as EducationItem[] | undefined;
  const skills = sections.find(s => s.type === "skills")?.content as string[] | undefined;

  // --- FORMATTING ---
  checks.push({
    id: "no-tables",
    category: "formatting",
    label: "No complex tables or columns",
    status: "pass",
    message: "Your resume uses a simple single-column layout — great for ATS parsing.",
    weight: 10,
  });

  checks.push({
    id: "no-images",
    category: "formatting",
    label: "No images or graphics",
    status: "pass",
    message: "No embedded images detected. ATS systems can't read images.",
    weight: 8,
  });

  const hasSpecialChars = summary && /[★●►▪♦☆]/.test(summary);
  checks.push({
    id: "special-chars",
    category: "formatting",
    label: "Standard characters used",
    status: hasSpecialChars ? "warn" : "pass",
    message: hasSpecialChars
      ? "Special symbols detected in summary. Use standard bullets (•) or hyphens instead."
      : "Standard characters used throughout — ATS compatible.",
    weight: 6,
  });

  const hasStandardHeadings = sections.some(s => s.type === "experience") && sections.some(s => s.type === "education");
  checks.push({
    id: "standard-headings",
    category: "formatting",
    label: "Standard section headings",
    status: hasStandardHeadings ? "pass" : "warn",
    message: hasStandardHeadings
      ? "Using standard section headings that ATS systems recognize."
      : "Missing standard headings (Experience, Education). ATS may not parse your resume correctly.",
    weight: 8,
  });

  // --- CONTENT ---
  checks.push({
    id: "contact-complete",
    category: "content",
    label: "Contact information complete",
    status: contact?.fullName && contact?.email && contact?.phone ? "pass" : contact?.fullName || contact?.email ? "warn" : "fail",
    message: contact?.fullName && contact?.email && contact?.phone
      ? "Name, email, and phone are all present."
      : "Missing key contact fields. Include full name, email, and phone number.",
    weight: 10,
  });

  checks.push({
    id: "has-summary",
    category: "content",
    label: "Professional summary present",
    status: summary && summary.length > 30 ? "pass" : summary ? "warn" : "fail",
    message: summary && summary.length > 30
      ? "Professional summary is well-developed."
      : "Add a professional summary (50+ words) with relevant keywords for your target role.",
    weight: 8,
  });

  const expCount = experience?.length || 0;
  checks.push({
    id: "experience-entries",
    category: "content",
    label: "Sufficient work experience",
    status: expCount >= 2 ? "pass" : expCount === 1 ? "warn" : "fail",
    message: expCount >= 2
      ? `${expCount} experience entries — good coverage.`
      : "Add more work experience entries with detailed descriptions.",
    weight: 8,
  });

  const hasQuantifiedResults = experience?.some(e =>
    /\d+%|\$[\d,]+|\d+ (people|clients|users|projects|teams)/i.test(e.description + " " + e.highlights.join(" "))
  );
  checks.push({
    id: "quantified-results",
    category: "content",
    label: "Quantified achievements",
    status: hasQuantifiedResults ? "pass" : "warn",
    message: hasQuantifiedResults
      ? "Quantified results detected (numbers, percentages, dollar amounts)."
      : "Add metrics to experience bullets (e.g., 'Increased sales by 25%'). ATS and recruiters favor quantified achievements.",
    weight: 7,
  });

  checks.push({
    id: "education-present",
    category: "content",
    label: "Education section present",
    status: education && education.length > 0 ? "pass" : "warn",
    message: education && education.length > 0
      ? "Education section is included."
      : "Add an education section — many ATS systems require it.",
    weight: 6,
  });

  checks.push({
    id: "skills-present",
    category: "content",
    label: "Skills section with keywords",
    status: skills && skills.length >= 5 ? "pass" : skills && skills.length > 0 ? "warn" : "fail",
    message: skills && skills.length >= 5
      ? `${skills.length} skills listed — good for keyword matching.`
      : "Add at least 5-10 relevant skills. This section is heavily weighted by ATS.",
    weight: 9,
  });

  // --- KEYWORDS ---
  if (jobDescription.trim()) {
    const jdWords = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const jdKeywords = [...new Set(jdWords)].filter(w =>
      !["that", "this", "with", "from", "have", "will", "been", "were", "they", "their", "about", "would", "which", "when", "what", "your", "into", "also", "more", "some", "than"].includes(w)
    );

    const resumeText = [
      summary || "",
      ...(experience?.flatMap(e => [e.position, e.company, e.description, ...e.highlights]) || []),
      ...(skills || []),
      ...(education?.map(e => `${e.degree} ${e.field} ${e.institution}`) || []),
    ].join(" ").toLowerCase();

    const matchedKeywords = jdKeywords.filter(kw => resumeText.includes(kw));
    const missingKeywords = jdKeywords.filter(kw => !resumeText.includes(kw)).slice(0, 15);
    const matchRate = jdKeywords.length > 0 ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) : 0;

    checks.push({
      id: "keyword-match",
      category: "keywords",
      label: `Keyword match rate: ${matchRate}%`,
      status: matchRate >= 60 ? "pass" : matchRate >= 35 ? "warn" : "fail",
      message: matchRate >= 60
        ? `Strong keyword alignment with the job description (${matchedKeywords.length}/${jdKeywords.length} keywords).`
        : `Low keyword match. Missing: ${missingKeywords.slice(0, 8).join(", ")}${missingKeywords.length > 8 ? "..." : ""}`,
      weight: 12,
    });

    // Check for exact job title match
    const jobTitleWords = jobDescription.split("\n")[0]?.toLowerCase().split(/\W+/).filter(w => w.length > 2) || [];
    const hasJobTitle = experience?.some(e => jobTitleWords.some(tw => e.position.toLowerCase().includes(tw)));
    checks.push({
      id: "job-title-match",
      category: "keywords",
      label: "Job title alignment",
      status: hasJobTitle ? "pass" : "warn",
      message: hasJobTitle
        ? "Your experience includes relevant job titles matching the posting."
        : "Consider aligning your job titles closer to the target role where accurate.",
      weight: 7,
    });
  } else {
    checks.push({
      id: "no-jd",
      category: "keywords",
      label: "No job description provided",
      status: "warn",
      message: "Paste a job description above to check keyword optimization.",
      weight: 0,
    });
  }

  // --- COMPATIBILITY ---
  checks.push({
    id: "parseable-format",
    category: "compatibility",
    label: "ATS-parseable structure",
    status: "pass",
    message: "Resume uses clean text-based sections that ATS systems can parse reliably.",
    weight: 10,
  });

  const sectionCount = sections.length;
  checks.push({
    id: "section-count",
    category: "compatibility",
    label: "Appropriate section count",
    status: sectionCount >= 4 && sectionCount <= 10 ? "pass" : "warn",
    message: sectionCount >= 4 && sectionCount <= 10
      ? `${sectionCount} sections — well-structured resume.`
      : sectionCount < 4
        ? "Too few sections. Add more to provide comprehensive information."
        : "Many sections detected. Consider consolidating to keep the resume focused.",
    weight: 5,
  });

  const totalTextLength = [
    summary || "",
    ...(experience?.flatMap(e => [e.description, ...e.highlights]) || []),
  ].join(" ").length;
  checks.push({
    id: "resume-length",
    category: "compatibility",
    label: "Resume length",
    status: totalTextLength > 300 && totalTextLength < 5000 ? "pass" : totalTextLength <= 300 ? "warn" : "warn",
    message: totalTextLength <= 300
      ? "Resume content is too short. Expand descriptions to improve ATS scoring."
      : totalTextLength > 5000
        ? "Resume may be too long. Keep it concise (1-2 pages) for best results."
        : "Resume length is appropriate for ATS processing.",
    weight: 5,
  });

  return checks;
}

function computeScore(checks: ATSCheck[]): number {
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;
  const earned = checks.reduce((sum, c) => {
    if (c.status === "pass") return sum + c.weight;
    if (c.status === "warn") return sum + c.weight * 0.5;
    return sum;
  }, 0);
  return Math.round((earned / totalWeight) * 100);
}

const statusIcon = {
  pass: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  fail: <XCircle className="h-4 w-4 text-red-500" />,
};

export function ATSScoreChecker({ resume, onFixIssues }: ATSScoreCheckerProps) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const checks = useMemo(() => runATSChecks(resume, jobDescription), [resume, jobDescription]);
  const score = useMemo(() => computeScore(checks), [checks]);

  const grouped = useMemo(() => {
    const map: Record<string, ATSCheck[]> = {};
    for (const c of checks) {
      (map[c.category] ??= []).push(c);
    }
    return map;
  }, [checks]);

  const passCount = checks.filter(c => c.status === "pass").length;
  const warnCount = checks.filter(c => c.status === "warn").length;
  const failCount = checks.filter(c => c.status === "fail").length;
  const fixableCount = warnCount + failCount;

  const handleFixIssues = useCallback(() => {
    if (!onFixIssues) return;
    let updated = { ...resume, sections: [...resume.sections] };
    let fixCount = 0;

    const hasSection = (type: SectionType) => updated.sections.some(s => s.type === type);

    // Fix missing education section
    if (!hasSection("education")) {
      updated.sections.push({
        id: `s-education-${Date.now()}`,
        type: "education",
        title: "Education",
        order: updated.sections.length,
        content: [] as EducationItem[],
      } as ResumeSection);
      fixCount++;
    }

    // Fix missing experience section
    if (!hasSection("experience")) {
      updated.sections.push({
        id: `s-experience-${Date.now()}`,
        type: "experience",
        title: "Work Experience",
        order: updated.sections.length,
        content: [] as ExperienceItem[],
      } as ResumeSection);
      fixCount++;
    }

    // Fix missing skills section
    if (!hasSection("skills")) {
      updated.sections.push({
        id: `s-skills-${Date.now()}`,
        type: "skills",
        title: "Skills",
        order: updated.sections.length,
        content: [] as string[],
      } as ResumeSection);
      fixCount++;
    }

    // Fix short or missing summary
    const summarySection = updated.sections.find(s => s.type === "summary");
    if (!summarySection) {
      updated.sections.push({
        id: `s-summary-${Date.now()}`,
        type: "summary",
        title: "Professional Summary",
        order: 1,
        content: "Results-driven professional with a proven track record of delivering impactful solutions. Skilled in cross-functional collaboration and committed to continuous improvement.",
      } as ResumeSection);
      fixCount++;
    } else if (typeof summarySection.content === "string" && summarySection.content.length < 30) {
      updated = {
        ...updated,
        sections: updated.sections.map(s =>
          s.id === summarySection.id
            ? { ...s, content: (s.content as string) + " Results-driven professional with a proven track record of delivering impactful solutions. Skilled in cross-functional collaboration and committed to continuous improvement." }
            : s
        ),
      };
      fixCount++;
    }

    // Fix special characters in summary
    const summaryForChars = updated.sections.find(s => s.type === "summary");
    if (summaryForChars && typeof summaryForChars.content === "string" && /[★●►▪♦☆]/.test(summaryForChars.content)) {
      updated = {
        ...updated,
        sections: updated.sections.map(s =>
          s.id === summaryForChars.id
            ? { ...s, content: (s.content as string).replace(/[★●►▪♦☆]/g, "•") }
            : s
        ),
      };
      fixCount++;
    }

    updated.updatedAt = new Date();
    onFixIssues(updated);
    toast.success(`Fixed ${fixCount} issue${fixCount !== 1 ? "s" : ""} automatically`);
  }, [resume, onFixIssues]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Shield className="mr-2 h-4 w-4" />
          ATS Check
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            ATS Compatibility Score
          </DialogTitle>
          <DialogDescription>
            Check how well your resume will perform with Applicant Tracking Systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score */}
          <div className="text-center space-y-3">
            <div className={cn(
              "text-5xl font-bold",
              score >= 80 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500"
            )}>
              {score}
            </div>
            <Progress value={score} className="h-3" />
            <div className="flex justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5" /> {passCount} passed
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" /> {warnCount} warnings
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <XCircle className="h-3.5 w-3.5" /> {failCount} issues
              </span>
            </div>
            {fixableCount > 0 && onFixIssues && (
              <Button onClick={handleFixIssues} className="w-full" variant="outline">
                <Wrench className="mr-2 h-4 w-4" />
                Fix {fixableCount} Issue{fixableCount !== 1 ? "s" : ""} Automatically
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label>Paste Job Description (optional — enables keyword analysis)</Label>
            <Textarea
              placeholder="Paste the job posting here to check keyword optimization..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          {/* Category Breakdown */}
          <div className="space-y-2">
            {(Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).map(cat => {
              const meta = categoryMeta[cat];
              const items = grouped[cat] || [];
              if (!items.length) return null;
              const isExpanded = expandedCategory === cat;
              const catPassed = items.filter(i => i.status === "pass").length;

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
                        {catPassed}/{items.length}
                      </Badge>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 space-y-3">
                      {items.map(check => (
                        <div key={check.id} className="flex items-start gap-3 pl-1">
                          <div className="mt-0.5">{statusIcon[check.status]}</div>
                          <div>
                            <p className="text-sm font-medium">{check.label}</p>
                            <p className="text-xs text-muted-foreground">{check.message}</p>
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
      </DialogContent>
    </Dialog>
  );
}
