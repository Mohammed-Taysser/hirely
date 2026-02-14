import { Resume, ContactInfo, ExperienceItem, EducationItem, VolunteerItem, PublicationItem, CourseItem, LanguageItem, ProjectItem, CertificationItem, ReferenceItem, AwardItem } from "@/types";

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  tier: "free" | "pro" | "premium";
  thumbnail: string;
  accentColor: string;
  previewStyle: {
    headerBg: string;
    headerText: string;
    accentBorder: string;
    bodyBg: string;
  };
  sections: {
    type: string;
    hasContent: boolean;
  }[];
}

// Section factory functions for creating empty or sample content
const sectionFactories: Record<string, (templateId?: string) => Resume["sections"][0]> = {
  contact: (templateId) => ({
    id: `s-contact-${Date.now()}`,
    type: "contact" as const,
    title: "Contact Information",
    order: 0,
    content: {
      fullName: templateId === "tech-professional" ? "Alex Chen" : "",
      email: templateId === "tech-professional" ? "alex.chen@email.com" : "",
      phone: templateId === "tech-professional" ? "+1 (555) 123-4567" : "",
      location: templateId === "tech-professional" ? "San Francisco, CA" : "",
      linkedin: templateId === "tech-professional" ? "linkedin.com/in/alexchen" : "",
      website: templateId === "tech-professional" ? "alexchen.dev" : "",
    } as ContactInfo,
  }),
  summary: (templateId) => ({
    id: `s-summary-${Date.now()}`,
    type: "summary" as const,
    title: "Professional Summary",
    order: 1,
    content: templateId === "tech-professional" 
      ? "Senior Software Engineer with 7+ years of experience building scalable web applications."
      : "",
  }),
  experience: () => ({
    id: `s-experience-${Date.now()}`,
    type: "experience" as const,
    title: "Work Experience",
    order: 2,
    content: [] as ExperienceItem[],
  }),
  education: () => ({
    id: `s-education-${Date.now()}`,
    type: "education" as const,
    title: "Education",
    order: 3,
    content: [] as EducationItem[],
  }),
  skills: (templateId) => ({
    id: `s-skills-${Date.now()}`,
    type: "skills" as const,
    title: "Skills",
    order: 4,
    content: templateId === "tech-professional"
      ? ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker"]
      : [] as string[],
  }),
  projects: () => ({
    id: `s-projects-${Date.now()}`,
    type: "projects" as const,
    title: "Projects",
    order: 5,
    content: [] as ProjectItem[],
  }),
  certifications: () => ({
    id: `s-certifications-${Date.now()}`,
    type: "certifications" as const,
    title: "Certifications",
    order: 6,
    content: [] as CertificationItem[],
  }),
  courses: () => ({
    id: `s-courses-${Date.now()}`,
    type: "courses" as const,
    title: "Courses & Training",
    order: 7,
    content: [] as CourseItem[],
  }),
  languages: () => ({
    id: `s-languages-${Date.now()}`,
    type: "languages" as const,
    title: "Languages",
    order: 8,
    content: [] as LanguageItem[],
  }),
  volunteer: () => ({
    id: `s-volunteer-${Date.now()}`,
    type: "volunteer" as const,
    title: "Volunteer Experience",
    order: 9,
    content: [] as VolunteerItem[],
  }),
  publications: () => ({
    id: `s-publications-${Date.now()}`,
    type: "publications" as const,
    title: "Publications",
    order: 10,
    content: [] as PublicationItem[],
  }),
  references: () => ({
    id: `s-references-${Date.now()}`,
    type: "references" as const,
    title: "References",
    order: 11,
    content: [] as ReferenceItem[],
  }),
  awards: () => ({
    id: `s-awards-${Date.now()}`,
    type: "awards" as const,
    title: "Awards & Honors",
    order: 12,
    content: [] as AwardItem[],
  }),
};

export function createResumeFromTemplate(template: ResumeTemplate): Resume {
  const now = new Date();

  const sections = template.sections.map((s, index) => {
    const factory = sectionFactories[s.type];
    if (!factory) {
      return {
        id: `s-${s.type}-${Date.now()}`,
        type: s.type as Resume["sections"][0]["type"],
        title: s.type.charAt(0).toUpperCase() + s.type.slice(1),
        order: index,
        content: "",
      };
    }
    const section = factory(template.id);
    section.order = index;
    return section;
  });

  return {
    id: `resume-${Date.now()}`,
    title: template.name,
    tier: template.tier,
    createdAt: now,
    updatedAt: now,
    sections,
  };
}

// Export section factories for backend PDF generation consistency
export { sectionFactories };

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with a clean slate",
    tier: "free",
    thumbnail: "📄",
    accentColor: "#64748b",
    previewStyle: {
      headerBg: "bg-muted",
      headerText: "text-foreground",
      accentBorder: "border-muted-foreground/30",
      bodyBg: "bg-card",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "skills", hasContent: false },
    ],
  },
  {
    id: "tech-professional",
    name: "Tech Professional",
    description: "Perfect for software engineers and developers",
    tier: "free",
    thumbnail: "💻",
    accentColor: "#3b82f6",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-blue-600 to-blue-500",
      headerText: "text-white",
      accentBorder: "border-blue-500",
      bodyBg: "bg-slate-50 dark:bg-slate-900",
    },
    sections: [
      { type: "contact", hasContent: true },
      { type: "summary", hasContent: true },
      { type: "experience", hasContent: false },
      { type: "skills", hasContent: true },
      { type: "education", hasContent: false },
    ],
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean and simple, focus on essentials",
    tier: "free",
    thumbnail: "✨",
    accentColor: "#1f2937",
    previewStyle: {
      headerBg: "bg-foreground",
      headerText: "text-background",
      accentBorder: "border-foreground/20",
      bodyBg: "bg-background",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "education", hasContent: false },
    ],
  },
  {
    id: "modern-coral",
    name: "Modern Coral",
    description: "Fresh and vibrant coral accent",
    tier: "free",
    thumbnail: "🌺",
    accentColor: "#f97316",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-orange-500 to-rose-500",
      headerText: "text-white",
      accentBorder: "border-orange-500",
      bodyBg: "bg-orange-50/50 dark:bg-orange-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "skills", hasContent: false },
    ],
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Stand out with a creative layout",
    tier: "pro",
    thumbnail: "🎨",
    accentColor: "#8b5cf6",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400",
      headerText: "text-white",
      accentBorder: "border-purple-500",
      bodyBg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "skills", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "projects", hasContent: false },
    ],
  },
  {
    id: "academic",
    name: "Academic CV",
    description: "Comprehensive format for academia with publications",
    tier: "pro",
    thumbnail: "🎓",
    accentColor: "#10b981",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-emerald-700 to-teal-600",
      headerText: "text-white",
      accentBorder: "border-emerald-500",
      bodyBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "education", hasContent: false },
      { type: "publications", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "skills", hasContent: false },
      { type: "languages", hasContent: false },
    ],
  },
  {
    id: "midnight-dark",
    name: "Midnight Dark",
    description: "Sleek dark theme with blue accents",
    tier: "pro",
    thumbnail: "🌙",
    accentColor: "#6366f1",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-slate-900 to-indigo-900",
      headerText: "text-white",
      accentBorder: "border-indigo-500",
      bodyBg: "bg-slate-900 dark:bg-slate-950",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "projects", hasContent: false },
      { type: "skills", hasContent: false },
    ],
  },
  {
    id: "rose-elegant",
    name: "Rose Elegant",
    description: "Sophisticated rose gold styling",
    tier: "pro",
    thumbnail: "🌹",
    accentColor: "#ec4899",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-pink-500 to-rose-400",
      headerText: "text-white",
      accentBorder: "border-pink-500",
      bodyBg: "bg-rose-50/50 dark:bg-rose-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "education", hasContent: false },
      { type: "skills", hasContent: false },
    ],
  },
  {
    id: "business-executive",
    name: "Executive",
    description: "Professional format for senior leaders",
    tier: "premium",
    thumbnail: "👔",
    accentColor: "#f59e0b",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-amber-600 to-orange-500",
      headerText: "text-white",
      accentBorder: "border-amber-500",
      bodyBg: "bg-gradient-to-b from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "skills", hasContent: false },
      { type: "education", hasContent: false },
      { type: "certifications", hasContent: false },
    ],
  },
  {
    id: "nordic-frost",
    name: "Nordic Frost",
    description: "Cool and calming Scandinavian design",
    tier: "premium",
    thumbnail: "❄️",
    accentColor: "#0ea5e9",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-sky-500 to-cyan-400",
      headerText: "text-white",
      accentBorder: "border-sky-500",
      bodyBg: "bg-sky-50/50 dark:bg-sky-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "projects", hasContent: false },
      { type: "certifications", hasContent: false },
      { type: "skills", hasContent: false },
    ],
  },
  {
    id: "community-leader",
    name: "Community Leader",
    description: "Highlight volunteer work and community impact",
    tier: "pro",
    thumbnail: "💚",
    accentColor: "#22c55e",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-green-600 to-emerald-500",
      headerText: "text-white",
      accentBorder: "border-green-500",
      bodyBg: "bg-green-50/50 dark:bg-green-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "volunteer", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "education", hasContent: false },
      { type: "skills", hasContent: false },
    ],
  },
  {
    id: "researcher",
    name: "Researcher",
    description: "Perfect for scientists and researchers",
    tier: "premium",
    thumbnail: "🔬",
    accentColor: "#8b5cf6",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-violet-600 to-purple-500",
      headerText: "text-white",
      accentBorder: "border-violet-500",
      bodyBg: "bg-violet-50/50 dark:bg-violet-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "education", hasContent: false },
      { type: "publications", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "projects", hasContent: false },
      { type: "certifications", hasContent: false },
      { type: "languages", hasContent: false },
    ],
  },
  {
    id: "complete-professional",
    name: "Complete Professional",
    description: "All sections for comprehensive profiles",
    tier: "premium",
    thumbnail: "⭐",
    accentColor: "#eab308",
    previewStyle: {
      headerBg: "bg-gradient-to-r from-yellow-500 to-amber-500",
      headerText: "text-white",
      accentBorder: "border-yellow-500",
      bodyBg: "bg-yellow-50/50 dark:bg-yellow-950/20",
    },
    sections: [
      { type: "contact", hasContent: false },
      { type: "summary", hasContent: false },
      { type: "experience", hasContent: false },
      { type: "education", hasContent: false },
      { type: "skills", hasContent: false },
      { type: "projects", hasContent: false },
      { type: "certifications", hasContent: false },
      { type: "courses", hasContent: false },
      { type: "volunteer", hasContent: false },
      { type: "publications", hasContent: false },
      { type: "languages", hasContent: false },
    ],
  },
];
