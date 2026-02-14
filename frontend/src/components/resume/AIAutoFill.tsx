import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Briefcase,
  GraduationCap,
  User,
  Code,
  FileText,
  Lightbulb,
  Copy,
  Check,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { SectionType } from "@/types";

interface SuggestionTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  industry?: string;
}

interface AIAutoFillProps {
  sectionType: SectionType;
  onApply: (content: string) => void;
}

const summaryTemplates: SuggestionTemplate[] = [
  {
    id: "tech-lead",
    title: "Tech Lead / Senior Developer",
    content: "Results-driven software engineer with 8+ years of experience leading cross-functional teams to deliver scalable solutions. Expert in full-stack development, cloud architecture, and agile methodologies. Proven track record of reducing deployment time by 60% and improving system performance by 40% through innovative technical strategies.",
    tags: ["Leadership", "Technical", "Results-focused"],
    industry: "Technology",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    content: "Strategic product manager with 5+ years of experience driving product vision from conception to launch. Skilled in user research, data-driven decision making, and stakeholder management. Successfully launched 12+ products generating $15M+ in annual revenue while maintaining 95% customer satisfaction ratings.",
    tags: ["Strategy", "Data-driven", "Customer-focused"],
    industry: "Product",
  },
  {
    id: "marketing",
    title: "Marketing Professional",
    content: "Creative marketing specialist with expertise in digital campaigns, brand strategy, and content marketing. Delivered 150% ROI on marketing spend through targeted campaigns and A/B testing. Skilled in SEO, social media marketing, and marketing automation tools with a passion for storytelling and audience engagement.",
    tags: ["Creative", "Digital", "ROI-focused"],
    industry: "Marketing",
  },
  {
    id: "data-analyst",
    title: "Data Analyst / Scientist",
    content: "Detail-oriented data professional with strong expertise in statistical analysis, machine learning, and data visualization. Experienced in transforming complex datasets into actionable business insights. Reduced operational costs by 25% through predictive modeling and automated reporting solutions.",
    tags: ["Analytical", "Technical", "Insights-driven"],
    industry: "Data & Analytics",
  },
  {
    id: "project-manager",
    title: "Project Manager",
    content: "PMP-certified project manager with 7+ years of experience delivering complex projects on time and under budget. Expertise in Agile and Waterfall methodologies with a track record of managing portfolios worth $20M+. Strong communicator skilled at aligning diverse stakeholders and driving organizational change.",
    tags: ["Certified", "Leadership", "Process-focused"],
    industry: "Management",
  },
  {
    id: "entry-level",
    title: "Entry Level / Recent Graduate",
    content: "Motivated recent graduate with a strong foundation in [field] and hands-on experience through internships and academic projects. Quick learner with excellent analytical skills and a passion for [industry]. Seeking to contribute fresh perspectives and grow professionally in a dynamic environment.",
    tags: ["Fresh", "Eager", "Growth-oriented"],
    industry: "General",
  },
];

const experienceTemplates: SuggestionTemplate[] = [
  {
    id: "exp-achievement",
    title: "Achievement-Focused",
    content: "• Spearheaded the development of [project/initiative], resulting in [X%] improvement in [metric]\n• Managed a team of [X] professionals, fostering collaboration and delivering [X] projects ahead of schedule\n• Implemented [technology/process] that reduced [costs/time] by [X%] while improving [quality/efficiency]",
    tags: ["Metrics", "Leadership", "Impact"],
  },
  {
    id: "exp-technical",
    title: "Technical Role",
    content: "• Designed and developed [system/application] using [technologies], serving [X]+ users\n• Optimized database queries and API performance, reducing response times by [X%]\n• Led code reviews and mentored junior developers, improving team code quality by [X%]",
    tags: ["Technical", "Development", "Mentorship"],
  },
  {
    id: "exp-customer",
    title: "Customer-Facing Role",
    content: "• Managed relationships with [X]+ enterprise clients, maintaining [X%] retention rate\n• Resolved complex customer issues, achieving [X%] satisfaction score\n• Generated $[X]M in upsell revenue through consultative selling and needs analysis",
    tags: ["Client Relations", "Revenue", "Problem-solving"],
  },
  {
    id: "exp-operations",
    title: "Operations Role",
    content: "• Streamlined operational workflows, reducing processing time by [X%]\n• Implemented quality control measures that decreased error rates from [X%] to [X%]\n• Managed vendor relationships and negotiated contracts saving $[X]K annually",
    tags: ["Efficiency", "Quality", "Cost Savings"],
  },
];

const skillSuggestions: Record<string, string[]> = {
  "Software Development": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Git", "AWS", "Docker", "Kubernetes", "REST APIs", "GraphQL", "CI/CD", "Agile/Scrum"],
  "Data & Analytics": ["Python", "SQL", "Tableau", "Power BI", "R", "Machine Learning", "TensorFlow", "Pandas", "Statistical Analysis", "Data Visualization", "ETL", "BigQuery"],
  "Product Management": ["Product Strategy", "User Research", "A/B Testing", "Agile", "Roadmapping", "Jira", "Figma", "Data Analysis", "Stakeholder Management", "Go-to-Market"],
  "Marketing": ["SEO", "SEM", "Google Analytics", "Social Media Marketing", "Content Strategy", "Email Marketing", "HubSpot", "Copywriting", "A/B Testing", "Brand Strategy"],
  "Project Management": ["PMP", "Agile/Scrum", "Waterfall", "Risk Management", "Stakeholder Management", "MS Project", "Jira", "Budget Management", "Resource Planning", "Change Management"],
  "Design": ["Figma", "Adobe Creative Suite", "Sketch", "UI/UX Design", "Prototyping", "User Research", "Design Systems", "Wireframing", "Typography", "Color Theory"],
  "Soft Skills": ["Leadership", "Communication", "Problem Solving", "Team Collaboration", "Critical Thinking", "Time Management", "Adaptability", "Conflict Resolution", "Presentation Skills"],
};

const actionVerbs = [
  "Achieved", "Accelerated", "Administered", "Analyzed", "Architected",
  "Built", "Championed", "Collaborated", "Consolidated", "Coordinated",
  "Delivered", "Designed", "Developed", "Directed", "Drove",
  "Enhanced", "Established", "Executed", "Expanded", "Facilitated",
  "Generated", "Grew", "Headed", "Implemented", "Improved",
  "Increased", "Initiated", "Innovated", "Launched", "Led",
  "Managed", "Mentored", "Modernized", "Negotiated", "Optimized",
  "Orchestrated", "Overhauled", "Pioneered", "Produced", "Reduced",
  "Reengineered", "Resolved", "Revamped", "Scaled", "Spearheaded",
  "Streamlined", "Strengthened", "Supervised", "Transformed", "Unified",
];

export function AIAutoFill({ sectionType, onApply }: AIAutoFillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (content: string) => {
    onApply(content);
    setIsOpen(false);
    toast.success("Content applied");
  };

  const renderSummaryContent = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a template that matches your experience level and industry, then customize it.
      </p>
      <div className="grid gap-3">
        {summaryTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border border-border bg-card/50 p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h4 className="font-medium text-sm">{template.title}</h4>
                {template.industry && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {template.industry}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(template.content, template.id)}
                >
                  {copiedId === template.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApply(template.content)}
                >
                  Apply
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {template.content}
            </p>
            <div className="flex gap-1 mt-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExperienceContent = () => (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="templates">Bullet Templates</TabsTrigger>
        <TabsTrigger value="verbs">Action Verbs</TabsTrigger>
      </TabsList>
      <TabsContent value="templates" className="space-y-3 mt-4">
        <p className="text-sm text-muted-foreground">
          Use these bullet point templates and replace [placeholders] with your specifics.
        </p>
        {experienceTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border border-border bg-card/50 p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-medium text-sm">{template.title}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(template.content, template.id)}
              >
                {copiedId === template.id ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
              {template.content}
            </pre>
            <div className="flex gap-1 mt-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="verbs" className="mt-4">
        <p className="text-sm text-muted-foreground mb-3">
          Start your bullet points with strong action verbs to make your achievements stand out.
        </p>
        <div className="flex flex-wrap gap-2">
          {actionVerbs.map((verb) => (
            <Badge
              key={verb}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleCopy(verb, verb)}
            >
              {verb}
            </Badge>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderSkillsContent = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click on skills to add them to your resume. Choose from different categories.
      </p>
      {Object.entries(skillSuggestions).map(([category, skills]) => (
        <div key={category}>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  onApply(skill);
                  toast.success(`Added "${skill}"`);
                }}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const getIcon = () => {
    switch (sectionType) {
      case "summary":
        return <FileText className="h-4 w-4" />;
      case "experience":
        return <Briefcase className="h-4 w-4" />;
      case "skills":
        return <Code className="h-4 w-4" />;
      case "education":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (sectionType) {
      case "summary":
        return "Summary Templates";
      case "experience":
        return "Experience Writing Help";
      case "skills":
        return "Skill Suggestions";
      default:
        return "AI Suggestions";
    }
  };

  const getDescription = () => {
    switch (sectionType) {
      case "summary":
        return "Professional summary templates tailored to different roles and industries";
      case "experience":
        return "Bullet point templates and action verbs to describe your achievements";
      case "skills":
        return "Common skills organized by category - click to add";
      default:
        return "AI-powered suggestions to help you write better content";
    }
  };

  const renderContent = () => {
    switch (sectionType) {
      case "summary":
        return renderSummaryContent();
      case "experience":
        return renderExperienceContent();
      case "skills":
        return renderSkillsContent();
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>AI suggestions for this section coming soon</p>
          </div>
        );
    }
  };

  // Only show for supported section types
  if (!["summary", "experience", "skills"].includes(sectionType)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI Assist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
