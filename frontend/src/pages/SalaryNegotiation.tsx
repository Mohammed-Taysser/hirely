import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, MapPin, Briefcase, Award, Lightbulb, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalaryEstimate {
  low: number;
  median: number;
  high: number;
  confidence: number;
}

interface NegotiationTip {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

const baseSalaries: Record<string, Record<string, number>> = {
  "software-engineer": { entry: 75000, mid: 120000, senior: 165000, lead: 195000 },
  "frontend-developer": { entry: 70000, mid: 110000, senior: 155000, lead: 185000 },
  "backend-developer": { entry: 72000, mid: 115000, senior: 160000, lead: 190000 },
  "fullstack-developer": { entry: 73000, mid: 118000, senior: 162000, lead: 192000 },
  "data-scientist": { entry: 80000, mid: 125000, senior: 170000, lead: 200000 },
  "devops-engineer": { entry: 78000, mid: 122000, senior: 168000, lead: 198000 },
  "product-manager": { entry: 82000, mid: 130000, senior: 175000, lead: 210000 },
  "ux-designer": { entry: 65000, mid: 100000, senior: 140000, lead: 170000 },
  "data-analyst": { entry: 60000, mid: 90000, senior: 125000, lead: 155000 },
  other: { entry: 65000, mid: 105000, senior: 145000, lead: 175000 },
};

const locationMultipliers: Record<string, number> = {
  "sf-bay": 1.4,
  "new-york": 1.35,
  seattle: 1.3,
  boston: 1.2,
  austin: 1.1,
  denver: 1.05,
  chicago: 1.05,
  remote: 1.0,
  "other-us": 0.95,
  europe: 0.85,
  asia: 0.7,
};

const skillPremiums: Record<string, number> = {
  react: 3000, typescript: 3000, python: 3000, aws: 5000, kubernetes: 5000,
  "machine-learning": 8000, rust: 6000, golang: 5000, "system-design": 6000,
  leadership: 7000, "cloud-architecture": 7000, security: 5000,
};

function estimateSalary(
  role: string,
  yearsExp: number,
  location: string,
  skills: string[],
  hasCerts: boolean,
  companySize: string
): SalaryEstimate {
  const level = yearsExp <= 2 ? "entry" : yearsExp <= 5 ? "mid" : yearsExp <= 10 ? "senior" : "lead";
  const base = baseSalaries[role]?.[level] || baseSalaries.other[level];
  const locMult = locationMultipliers[location] || 1.0;
  const skillBonus = skills.reduce((sum, s) => sum + (skillPremiums[s.toLowerCase().replace(/\s+/g, "-")] || 1500), 0);
  const certBonus = hasCerts ? base * 0.05 : 0;
  const sizeBonus = companySize === "enterprise" ? base * 0.1 : companySize === "startup" ? -base * 0.05 : 0;

  const adjusted = (base + skillBonus + certBonus + sizeBonus) * locMult;
  const low = Math.round(adjusted * 0.85 / 1000) * 1000;
  const median = Math.round(adjusted / 1000) * 1000;
  const high = Math.round(adjusted * 1.2 / 1000) * 1000;

  const confidence = Math.min(95, 50 + (skills.length * 5) + (yearsExp > 0 ? 15 : 0) + (location !== "" ? 10 : 0));

  return { low, median, high, confidence };
}

function generateTips(estimate: SalaryEstimate, yearsExp: number, skills: string[], hasCerts: boolean): NegotiationTip[] {
  const tips: NegotiationTip[] = [];
  let id = 0;

  tips.push({
    id: `t-${id++}`,
    title: "Research before negotiating",
    description: `Your estimated range is $${(estimate.low / 1000).toFixed(0)}K–$${(estimate.high / 1000).toFixed(0)}K. Use sites like Levels.fyi, Glassdoor, and Blind to validate this range for your specific company.`,
    priority: "high",
  });

  tips.push({
    id: `t-${id++}`,
    title: "Never share your current salary first",
    description: "Let the employer make the first offer. If pressed, redirect: 'I'm looking for a role in the range of...' using the top of your estimated range.",
    priority: "high",
  });

  if (yearsExp >= 5) {
    tips.push({
      id: `t-${id++}`,
      title: "Leverage your seniority",
      description: `With ${yearsExp}+ years of experience, emphasize leadership impact, mentoring, and strategic contributions — these justify senior-level compensation.`,
      priority: "high",
    });
  }

  if (skills.length >= 5) {
    tips.push({
      id: `t-${id++}`,
      title: "Highlight your diverse skill set",
      description: `Your ${skills.length} skills show versatility. Emphasize how this breadth reduces hiring needs and accelerates project delivery.`,
      priority: "medium",
    });
  }

  if (!hasCerts) {
    tips.push({
      id: `t-${id++}`,
      title: "Consider getting certified",
      description: "Industry certifications (AWS, GCP, PMP, etc.) can add 5-10% to your market value and strengthen negotiation leverage.",
      priority: "medium",
    });
  }

  tips.push({
    id: `t-${id++}`,
    title: "Negotiate the full package",
    description: "Beyond base salary, negotiate signing bonus, equity/RSUs, remote flexibility, PTO, learning budget, and title. These can add 20-40% to total compensation.",
    priority: "high",
  });

  tips.push({
    id: `t-${id++}`,
    title: "Use competing offers",
    description: "Multiple offers are your strongest leverage. Even if you prefer one company, having alternatives gives you negotiating power.",
    priority: "medium",
  });

  tips.push({
    id: `t-${id++}`,
    title: "Get everything in writing",
    description: "Before accepting, request a formal written offer. Verbal commitments about bonuses, equity, or promotions should be documented.",
    priority: "low",
  });

  return tips;
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function SalaryNegotiation() {
  const [role, setRole] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [hasCerts, setHasCerts] = useState(false);
  const [companySize, setCompanySize] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const skills = useMemo(() => skillsInput.split(",").map(s => s.trim()).filter(Boolean), [skillsInput]);
  const years = parseInt(yearsExp) || 0;

  const estimate = useMemo(
    () => estimateSalary(role, years, location, skills, hasCerts, companySize),
    [role, years, location, skills, hasCerts, companySize]
  );

  const tips = useMemo(() => generateTips(estimate, years, skills, hasCerts), [estimate, years, skills, hasCerts]);

  const hasInput = role || years > 0 || location;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8" />
            Salary Negotiation Helper
          </h1>
          <p className="text-muted-foreground mt-1">
            Get estimated salary ranges and negotiation tips based on your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineer">Software Engineer</SelectItem>
                    <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                    <SelectItem value="backend-developer">Backend Developer</SelectItem>
                    <SelectItem value="fullstack-developer">Full Stack Developer</SelectItem>
                    <SelectItem value="data-scientist">Data Scientist</SelectItem>
                    <SelectItem value="devops-engineer">DevOps Engineer</SelectItem>
                    <SelectItem value="product-manager">Product Manager</SelectItem>
                    <SelectItem value="ux-designer">UX Designer</SelectItem>
                    <SelectItem value="data-analyst">Data Analyst</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input type="number" placeholder="e.g. 5" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} min={0} max={40} />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sf-bay">SF Bay Area</SelectItem>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="seattle">Seattle</SelectItem>
                    <SelectItem value="boston">Boston</SelectItem>
                    <SelectItem value="austin">Austin</SelectItem>
                    <SelectItem value="denver">Denver</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="remote">Remote (US)</SelectItem>
                    <SelectItem value="other-us">Other US</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Key Skills (comma-separated)</Label>
                <Input placeholder="e.g. React, TypeScript, AWS" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (&lt;50)</SelectItem>
                    <SelectItem value="mid">Mid-size (50-500)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="certs"
                  checked={hasCerts}
                  onChange={(e) => setHasCerts(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="certs" className="cursor-pointer">I have relevant certifications</Label>
              </div>

              <div className="space-y-2">
                <Label>Job Description (optional)</Label>
                <Textarea
                  placeholder="Paste job description for more context..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Salary Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estimated Salary Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasInput ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Low End</p>
                        <p className="text-xl font-bold">{fmt(estimate.low)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Median</p>
                        <p className="text-2xl font-bold text-primary">{fmt(estimate.median)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">High End</p>
                        <p className="text-xl font-bold">{fmt(estimate.high)}</p>
                      </div>
                    </div>

                    {/* Visual Range Bar */}
                    <div className="space-y-2">
                      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-muted-foreground/30 via-primary to-muted-foreground/30 rounded-full"
                          style={{ left: "10%", right: "10%" }}
                        />
                        <div
                          className="absolute h-full w-1 bg-primary rounded-full"
                          style={{ left: "50%", transform: "translateX(-50%)" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{fmt(estimate.low)}</span>
                        <span className="font-medium text-foreground">{fmt(estimate.median)}</span>
                        <span>{fmt(estimate.high)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Progress value={estimate.confidence} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{estimate.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add more details about your role, location, and skills to increase confidence.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Fill in your profile to see salary estimates</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Negotiation Tips */}
            {hasInput && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Negotiation Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tips.map(tip => (
                    <div key={tip.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <Badge
                        variant={tip.priority === "high" ? "default" : tip.priority === "medium" ? "secondary" : "outline"}
                        className="mt-0.5 shrink-0 text-xs"
                      >
                        {tip.priority}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{tip.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
