import { useState, useCallback, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableSection } from "@/components/resume/DraggableSection";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { ResumeAnalyzer } from "@/components/resume/ResumeAnalyzer";
import { VersionHistory } from "@/components/resume/VersionHistory";
import { StyleCustomizer, ResumeStyle, defaultStyle } from "@/components/resume/StyleCustomizer";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useResumeHistory } from "@/hooks/useResumeHistory";
import { usePrintResume } from "@/hooks/usePrintResume";
import { useExportResume } from "@/hooks/useExportResume";
import { createResumeFromTemplate, ResumeTemplate, resumeTemplates } from "@/data/resumeTemplates";
import {
  Save,
  Download,
  Eye,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Loader2,
  LayoutTemplate,
  Sparkles,
  History,
  Palette,
  Printer,
  FileDown,
  Copy,
  FileJson,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Resume, ResumeSection, SectionType, ContactInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem, CourseItem, LanguageItem, VolunteerItem, PublicationItem, ReferenceItem, AwardItem } from "@/types";
import { ExperienceEditor } from "@/components/resume/ExperienceEditor";
import { EducationEditor } from "@/components/resume/EducationEditor";
import { ProjectsEditor } from "@/components/resume/ProjectsEditor";
import { CertificationsEditor } from "@/components/resume/CertificationsEditor";
import { CoursesEditor } from "@/components/resume/CoursesEditor";
import { LanguagesEditor } from "@/components/resume/LanguagesEditor";
import { VolunteerEditor } from "@/components/resume/VolunteerEditor";
import { PublicationsEditor } from "@/components/resume/PublicationsEditor";
import { ReferencesEditor } from "@/components/resume/ReferencesEditor";
import { AwardsEditor } from "@/components/resume/AwardsEditor";
import { AddSectionDropdown } from "@/components/resume/AddSectionDropdown";
import { ResumeComments } from "@/components/resume/ResumeComments";
import { ResumeScoreIndicator } from "@/components/resume/ResumeScoreIndicator";
import { VersionComparison } from "@/components/resume/VersionComparison";
import { ResumeImport } from "@/components/resume/ResumeImport";
import { ResumeSharing } from "@/components/resume/ResumeSharing";
import { KeyboardShortcutsHelp } from "@/components/resume/KeyboardShortcutsHelp";
import { AIAutoFill } from "@/components/resume/AIAutoFill";
import { AIWritingAssistant } from "@/components/resume/AIWritingAssistant";
import { AIJobMatcher } from "@/components/resume/AIJobMatcher";
import { JobDescriptionTailor } from "@/components/resume/JobDescriptionTailor";
import { ATSScoreChecker } from "@/components/resume/ATSScoreChecker";
import { useTemplateExport } from "@/hooks/useTemplateExport";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { BookOpen, Languages, Heart, Users, Trophy, TrendingUp } from "lucide-react";

const sectionIcons: Record<SectionType, React.ElementType> = {
  contact: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Code,
  projects: Code,
  certifications: Award,
  courses: BookOpen,
  languages: Languages,
  volunteer: Heart,
  publications: FileText,
  references: Users,
  awards: Trophy,
};

const sectionLabels: Record<SectionType, string> = {
  contact: "Contact Information",
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  courses: "Courses",
  languages: "Languages",
  volunteer: "Volunteer Experience",
  publications: "Publications",
  references: "References",
  awards: "Awards & Honors",
};

const defaultResume: Resume = {
  id: "new",
  title: "Untitled Resume",
  tier: "free",
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [
    {
      id: "s1",
      type: "contact",
      title: "Contact Information",
      order: 0,
      content: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        website: "",
      } as ContactInfo,
    },
    {
      id: "s2",
      type: "summary",
      title: "Professional Summary",
      order: 1,
      content: "",
    },
    {
      id: "s3",
      type: "experience",
      title: "Work Experience",
      order: 2,
      content: [] as ExperienceItem[],
    },
    {
      id: "s4",
      type: "skills",
      title: "Skills",
      order: 3,
      content: [] as string[],
    },
  ],
};

function ContactEditor({ section, onUpdate }: { section: ResumeSection; onUpdate: (content: ContactInfo) => void }) {
  const content = section.content as ContactInfo;
  
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={content.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={content.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="+1 (555) 123-4567"
          value={content.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="San Francisco, CA"
          value={content.location}
          onChange={(e) => handleChange("location", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          placeholder="linkedin.com/in/johndoe"
          value={content.linkedin || ""}
          onChange={(e) => handleChange("linkedin", e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          placeholder="johndoe.com"
          value={content.website || ""}
          onChange={(e) => handleChange("website", e.target.value)}
        />
      </div>
    </div>
  );
}

function SummaryEditor({ section, onUpdate }: { section: ResumeSection; onUpdate: (content: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="summary">Write a brief professional summary</Label>
        <AIAutoFill sectionType="summary" onApply={onUpdate} />
      </div>
      <Textarea
        id="summary"
        placeholder="Passionate professional with X years of experience..."
        className="min-h-[120px]"
        value={section.content as string}
        onChange={(e) => onUpdate(e.target.value)}
      />
    </div>
  );
}

function SkillsEditor({ section, onUpdate }: { section: ResumeSection; onUpdate: (content: string[]) => void }) {
  const skills = section.content as string[];
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim()) {
      onUpdate([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addSkillFromAI = (skill: string) => {
    if (!skills.includes(skill)) {
      onUpdate([...skills, skill]);
    }
  };

  const removeSkill = (index: number) => {
    onUpdate(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-1 mr-2">
          <Input
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addSkill()}
          />
          <Button onClick={addSkill} variant="secondary">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <AIAutoFill sectionType="skills" onApply={addSkillFromAI} />
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="pl-3 pr-1 py-1.5 flex items-center gap-1"
          >
            {skill}
            <button
              onClick={() => removeSkill(index)}
              className="ml-1 p-0.5 rounded-full hover:bg-foreground/10"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
function SectionEditorContent({ section, onUpdate }: { section: ResumeSection; onUpdate: (content: ResumeSection["content"]) => void }) {
  switch (section.type) {
    case "contact":
      return <ContactEditor section={section} onUpdate={onUpdate as (content: ContactInfo) => void} />;
    case "summary":
      return <SummaryEditor section={section} onUpdate={onUpdate as (content: string) => void} />;
    case "skills":
      return <SkillsEditor section={section} onUpdate={onUpdate as (content: string[]) => void} />;
    case "experience":
      return <ExperienceEditor section={section} onUpdate={onUpdate as (content: ExperienceItem[]) => void} />;
    case "education":
      return <EducationEditor section={section} onUpdate={onUpdate as (content: EducationItem[]) => void} />;
    case "projects":
      return <ProjectsEditor section={section} onUpdate={onUpdate as (content: ProjectItem[]) => void} />;
    case "certifications":
      return <CertificationsEditor section={section} onUpdate={onUpdate as (content: CertificationItem[]) => void} />;
    case "courses":
      return <CoursesEditor section={section} onUpdate={onUpdate as (content: CourseItem[]) => void} />;
    case "languages":
      return <LanguagesEditor section={section} onUpdate={onUpdate as (content: LanguageItem[]) => void} />;
    case "volunteer":
      return <VolunteerEditor section={section} onUpdate={onUpdate as (content: VolunteerItem[]) => void} />;
    case "publications":
      return <PublicationsEditor section={section} onUpdate={onUpdate as (content: PublicationItem[]) => void} />;
    case "references":
      return <ReferencesEditor section={section} onUpdate={onUpdate as (content: ReferenceItem[]) => void} />;
    case "awards":
      return <AwardsEditor section={section} onUpdate={onUpdate as (content: AwardItem[]) => void} />;
    default:
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Editor for {section.type} coming soon</p>
        </div>
      );
  }
}

interface ResumePreviewProps {
  resume: Resume;
  previewRef: React.RefObject<HTMLDivElement>;
  style?: ResumeStyle;
  hiddenSections?: Set<string>;
}

function ResumePreview({ resume, previewRef, style = defaultStyle, hiddenSections = new Set() }: ResumePreviewProps) {
  const sortedSections = [...resume.sections]
    .filter(s => !hiddenSections.has(s.id))
    .sort((a, b) => a.order - b.order);

  const fontFamilyMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    georgia: "Georgia, serif",
    times: "'Times New Roman', serif",
    helvetica: "Helvetica, Arial, sans-serif",
  };

  const headerAlignmentMap: Record<string, string> = {
    centered: "text-center",
    left: "text-left",
    compact: "text-left",
  };

  const previewStyles: React.CSSProperties = {
    fontFamily: fontFamilyMap[style.fontFamily] || fontFamilyMap.inter,
    fontSize: `${style.fontSize}px`,
    lineHeight: style.spacing === 0.5 ? 1.3 : style.spacing === 1 ? 1.5 : 1.7,
    "--accent-color": style.accentColor,
  } as React.CSSProperties;

  const renderSection = (section: ResumeSection) => {
    switch (section.type) {
      case "contact": {
        const contact = section.content as ContactInfo;
        if (!contact?.fullName && !contact?.email) return null;
        return (
          <div 
            key={section.id} 
            className={`border-b pb-6 mb-6 ${headerAlignmentMap[style.headerStyle]}`}
            style={{ borderColor: style.accentColor }}
          >
            <h2 className="text-2xl font-bold" style={{ color: style.accentColor }}>
              {contact.fullName || "Your Name"}
            </h2>
            <div className={`flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground ${style.headerStyle === "centered" ? "justify-center" : ""}`}>
              {contact.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {contact.email}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {contact.phone}
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {contact.location}
                </div>
              )}
            </div>
            <div className={`flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground ${style.headerStyle === "centered" ? "justify-center" : ""}`}>
              {contact.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="h-3.5 w-3.5" />
                  {contact.linkedin}
                </div>
              )}
              {contact.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {contact.website}
                </div>
              )}
            </div>
          </div>
        );
      }
      case "summary": {
        const summary = section.content as string;
        if (!summary) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-2"
              style={{ color: style.accentColor }}
            >
              Professional Summary
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          </div>
        );
      }
      case "experience": {
        const experience = section.content as ExperienceItem[];
        if (!experience?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Work Experience
            </h3>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div 
                  key={exp.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">{exp.position}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <div 
                      className="text-sm text-muted-foreground mt-2 prose prose-sm dark:prose-invert max-w-none [&>p]:my-1"
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  )}
                  {exp.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span style={{ color: style.accentColor }} className="mt-1.5">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "education": {
        const education = section.content as EducationItem[];
        if (!education?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Education
            </h3>
            <div className="space-y-3">
              {education.map((edu) => (
                <div 
                  key={edu.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {edu.degree} in {edu.field}
                      </h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {edu.startDate} — {edu.endDate || "Present"}
                    </span>
                  </div>
                  {edu.gpa && (
                    <p className="text-xs text-muted-foreground mt-1">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "projects": {
        const projects = section.content as ProjectItem[];
        if (!projects?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Projects
            </h3>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div 
                  key={proj.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{proj.name}</h4>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: style.accentColor }}
                      >
                        View →
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <div 
                      className="text-sm text-muted-foreground mt-1 prose prose-sm dark:prose-invert max-w-none [&>p]:my-1"
                      dangerouslySetInnerHTML={{ __html: proj.description }}
                    />
                  )}
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded"
                          style={{ 
                            backgroundColor: `${style.accentColor}15`,
                            color: style.accentColor 
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "certifications": {
        const certifications = section.content as CertificationItem[];
        if (!certifications?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Certifications
            </h3>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div 
                  key={cert.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <h4 className="font-medium text-foreground">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  <p className="text-xs text-muted-foreground">
                    Issued: {cert.date}
                    {cert.expiryDate && <span> • Expires: {cert.expiryDate}</span>}
                    {cert.credentialId && <span> • ID: {cert.credentialId}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "courses": {
        const courses = section.content as CourseItem[];
        if (!courses?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Courses & Training
            </h3>
            <div className="space-y-2">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{course.name}</h4>
                    {course.credentialUrl && (
                      <a
                        href={course.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: style.accentColor }}
                      >
                        View →
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                  {course.completionDate && (
                    <p className="text-xs text-muted-foreground">Completed: {course.completionDate}</p>
                  )}
                  {course.skills && course.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {course.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded"
                          style={{ 
                            backgroundColor: `${style.accentColor}15`,
                            color: style.accentColor 
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "languages": {
        const languages = section.content as LanguageItem[];
        if (!languages?.length) return null;
        const proficiencyLabels: Record<string, string> = {
          native: "Native",
          fluent: "Fluent",
          advanced: "Advanced",
          intermediate: "Intermediate",
          basic: "Basic",
        };
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Languages
            </h3>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang) => (
                <div 
                  key={lang.id} 
                  className="px-3 py-2 rounded-lg border"
                  style={{ borderColor: `${style.accentColor}30` }}
                >
                  <span className="font-medium text-foreground">{lang.language}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    ({proficiencyLabels[lang.proficiency] || lang.proficiency})
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "skills": {
        const skills = section.content as string[];
        if (!skills?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-2"
              style={{ color: style.accentColor }}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-md"
                  style={{ 
                    backgroundColor: `${style.accentColor}15`,
                    color: style.accentColor 
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      }
      case "volunteer": {
        const volunteer = section.content as VolunteerItem[];
        if (!volunteer?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Volunteer Experience
            </h3>
            <div className="space-y-4">
              {volunteer.map((vol) => (
                <div 
                  key={vol.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">{vol.role}</h4>
                      <p className="text-sm text-muted-foreground">{vol.organization}</p>
                      {vol.cause && (
                        <p className="text-xs text-muted-foreground mt-0.5">{vol.cause}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {vol.startDate} — {vol.current ? "Present" : vol.endDate}
                    </span>
                  </div>
                  {vol.description && (
                    <div 
                      className="text-sm text-muted-foreground mt-2 prose prose-sm dark:prose-invert max-w-none [&>p]:my-1"
                      dangerouslySetInnerHTML={{ __html: vol.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "publications": {
        const publications = section.content as PublicationItem[];
        if (!publications?.length) return null;
        const typeLabels: Record<string, string> = {
          journal: "Journal Article",
          conference: "Conference Paper",
          book: "Book",
          chapter: "Book Chapter",
          thesis: "Thesis",
          patent: "Patent",
          whitepaper: "White Paper",
          blog: "Blog Post",
          other: "Publication",
        };
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Publications
            </h3>
            <div className="space-y-3">
              {publications.map((pub) => (
                <div 
                  key={pub.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{pub.title}</h4>
                    {pub.url && (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: style.accentColor }}
                      >
                        View →
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {typeLabels[pub.type] || pub.type}
                    {pub.publisher && ` • ${pub.publisher}`}
                    {pub.date && ` • ${pub.date}`}
                  </p>
                  {pub.authors && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Authors: {pub.authors}
                    </p>
                  )}
                  {pub.doi && (
                    <p className="text-xs text-muted-foreground">
                      DOI: {pub.doi}
                    </p>
                  )}
                  {pub.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {pub.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "references": {
        const references = section.content as ReferenceItem[];
        if (!references?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              References
            </h3>
            <div className="space-y-3">
              {references.map((ref) => (
                <div 
                  key={ref.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <h4 className="font-medium text-foreground">{ref.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {ref.title}{ref.company && ` at ${ref.company}`}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {ref.relationship}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {ref.email && <span>{ref.email}</span>}
                    {ref.phone && <span>{ref.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "awards": {
        const awards = section.content as AwardItem[];
        if (!awards?.length) return null;
        return (
          <div key={section.id} className="mb-6">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: style.accentColor }}
            >
              Awards & Honors
            </h3>
            <div className="space-y-3">
              {awards.map((award) => (
                <div 
                  key={award.id} 
                  className="border-l-2 pl-4"
                  style={{ borderColor: `${style.accentColor}50` }}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{award.title}</h4>
                    {award.url && (
                      <a
                        href={award.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: style.accentColor }}
                      >
                        View →
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {award.issuer}{award.date && ` • ${award.date}`}
                  </p>
                  {award.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {award.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const hasContent = sortedSections.some((section) => {
    if (section.type === "contact") {
      const c = section.content as ContactInfo;
      return c?.fullName || c?.email;
    }
    if (section.type === "summary") return !!section.content;
    if (Array.isArray(section.content)) return section.content.length > 0;
    return false;
  });

  return (
    <div 
      ref={previewRef} 
      className="bg-card border border-border rounded-xl p-8 shadow-lg"
      style={previewStyles}
    >
      {sortedSections.map(renderSection)}
      
      {!hasContent && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start filling in your information to see the preview</p>
        </div>
      )}
    </div>
  );
}

export default function ResumeEditor() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume>(defaultResume);
  const [expandedSection, setExpandedSection] = useState<string>("s1");
  const [previewMode, setPreviewMode] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStyleCustomizer, setShowStyleCustomizer] = useState(false);
  const [showScoreIndicator, setShowScoreIndicator] = useState(false);
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>(defaultStyle);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const previewRef = useRef<HTMLDivElement>(null);
  
  const { 
    versions, 
    currentVersionIndex, 
    saveVersion, 
    restoreVersion, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useResumeHistory(defaultResume);
  
  const { exportToPdf, isExporting } = usePdfExport({ 
    filename: resume.title.replace(/\s+/g, "-").toLowerCase() 
  });
  
  const { printResume } = usePrintResume({ style: resumeStyle });
  const { exportToDocx, exportToHtml } = useExportResume({ style: resumeStyle });
  const { exportAsJson, copyToClipboard } = useTemplateExport({ 
    style: resumeStyle, 
    hiddenSections 
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateSection = useCallback((sectionId: string, content: ResumeSection["content"]) => {
    setResume(prev => ({
      ...prev,
      updatedAt: new Date(),
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, content } : s
      ),
    }));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setResume(prev => {
        const oldIndex = prev.sections.findIndex(s => s.id === active.id);
        const newIndex = prev.sections.findIndex(s => s.id === over.id);

        const newSections = arrayMove(prev.sections, oldIndex, newIndex).map(
          (section, index) => ({ ...section, order: index })
        );

        return {
          ...prev,
          updatedAt: new Date(),
          sections: newSections,
        };
      });
      toast.success("Section reordered");
    }
  }, []);

  const addSection = useCallback((type: SectionType) => {
    const sectionDefaults: Record<SectionType, ResumeSection["content"]> = {
      contact: { fullName: "", email: "", phone: "", location: "", linkedin: "", website: "" } as ContactInfo,
      summary: "",
      experience: [] as ExperienceItem[],
      education: [] as EducationItem[],
      skills: [] as string[],
      projects: [] as ProjectItem[],
      certifications: [] as CertificationItem[],
      courses: [] as CourseItem[],
      languages: [] as LanguageItem[],
      volunteer: [] as VolunteerItem[],
      publications: [] as PublicationItem[],
      references: [] as ReferenceItem[],
      awards: [] as AwardItem[],
    };

    const newSection: ResumeSection = {
      id: `s-${type}-${Date.now()}`,
      type,
      title: sectionLabels[type],
      order: resume.sections.length,
      content: sectionDefaults[type],
    };

    setResume(prev => ({
      ...prev,
      updatedAt: new Date(),
      sections: [...prev.sections, newSection],
    }));
    setExpandedSection(newSection.id);
    toast.success(`${sectionLabels[type]} section added`);
  }, [resume.sections.length]);

  const deleteSection = useCallback((sectionId: string) => {
    setResume(prev => ({
      ...prev,
      updatedAt: new Date(),
      sections: prev.sections
        .filter(s => s.id !== sectionId)
        .map((s, index) => ({ ...s, order: index })),
    }));
    toast.success("Section deleted");
  }, []);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setHiddenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
        toast.success("Section is now visible");
      } else {
        next.add(sectionId);
        toast.success("Section hidden from preview");
      }
      return next;
    });
  }, []);

  const handleSelectTemplate = useCallback((template: ResumeTemplate) => {
    const newResume = createResumeFromTemplate(template);
    setResume(newResume);
    setExpandedSection(newResume.sections[0]?.id || "");
    saveVersion(newResume, `Applied template: ${template.name}`);
    toast.success(`Template "${template.name}" applied`);
  }, [saveVersion]);

  const handleExportPdf = useCallback(() => {
    exportToPdf(previewRef);
  }, [exportToPdf]);

  const handlePrint = useCallback(() => {
    printResume(resume);
  }, [printResume, resume]);

  const handleExportDocx = useCallback(() => {
    exportToDocx(resume);
    toast.success("DOCX exported successfully");
  }, [exportToDocx, resume]);

  const handleExportHtml = useCallback(() => {
    exportToHtml(resume);
    toast.success("HTML exported successfully");
  }, [exportToHtml, resume]);

  const handleExportJson = useCallback(() => {
    exportAsJson(resume);
  }, [exportAsJson, resume]);

  const handleCopyTemplateJson = useCallback(() => {
    copyToClipboard(resume);
  }, [copyToClipboard, resume]);

  const handleDuplicate = useCallback(() => {
    const duplicatedResume: Resume = {
      ...resume,
      id: `resume-${Date.now()}`,
      title: `${resume.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: resume.sections.map(s => ({
        ...s,
        id: `${s.id}-copy-${Date.now()}`,
      })),
    };
    setResume(duplicatedResume);
    saveVersion(duplicatedResume, "Duplicated resume");
    toast.success("Resume duplicated successfully");
  }, [resume, saveVersion]);

  const handleSave = useCallback(() => {
    saveVersion(resume, "Manual save");
    toast.success("Resume saved successfully");
  }, [resume, saveVersion]);

  const handleRestoreVersion = useCallback((versionId: string) => {
    const restored = restoreVersion(versionId);
    if (restored) {
      setResume(restored);
      toast.success("Version restored");
    }
  }, [restoreVersion]);

  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev) {
      setResume(prev);
      toast.success("Undo successful");
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (next) {
      setResume(next);
      toast.success("Redo successful");
    }
  }, [redo]);

  const sortedSections = [...resume.sections].sort((a, b) => a.order - b.order);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleSave,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDuplicate: handleDuplicate,
    onPreview: () => setPreviewMode(prev => !prev),
    onPrint: handlePrint,
    enabled: true,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Input
              value={resume.title}
              onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
              className="text-2xl font-display font-bold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
            />
            <p className="text-muted-foreground mt-1">
              Drag sections to reorder. Preview and export when ready.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <KeyboardShortcutsHelp />
            <ResumeImport onImport={(imported) => {
              setResume(imported);
              saveVersion(imported, "Imported resume");
            }} />
            <AIJobMatcher resume={resume} />
            <ATSScoreChecker resume={resume} onFixIssues={(updated) => {
              setResume(updated);
              saveVersion(updated, "Auto-fixed ATS issues");
            }} />
            <JobDescriptionTailor resume={resume} onApplyChanges={(updated) => {
              setResume(updated);
              saveVersion(updated, "Tailored to job description");
            }} />
            <ResumeSharing resume={resume} />
            <Button
              variant="outline"
              onClick={() => navigate("/cover-letter", { state: { resume } })}
            >
              <FileText className="mr-2 h-4 w-4" />
              Cover Letter
            </Button>
            <ResumeComments resumeId={resume.id} />
            <Button
              variant={showWritingAssistant ? "secondary" : "outline"}
              onClick={() => setShowWritingAssistant(!showWritingAssistant)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Writer
            </Button>
            <Button
              variant="outline"
              onClick={() => setTemplateSelectorOpen(true)}
            >
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button
              variant="outline"
              onClick={handleDuplicate}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant={showHistory ? "secondary" : "outline"}
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button
              variant={showVersionComparison ? "secondary" : "outline"}
              onClick={() => setShowVersionComparison(!showVersionComparison)}
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Compare
            </Button>
            <Button
              variant={showStyleCustomizer ? "secondary" : "outline"}
              onClick={() => setShowStyleCustomizer(!showStyleCustomizer)}
            >
              <Palette className="mr-2 h-4 w-4" />
              Style
            </Button>
            <Button
              variant={showScoreIndicator ? "secondary" : "outline"}
              onClick={() => setShowScoreIndicator(!showScoreIndicator)}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Score
            </Button>
            <Button
              variant={showAnalyzer ? "secondary" : "outline"}
              onClick={() => setShowAnalyzer(!showAnalyzer)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze
            </Button>
            <Button
              variant={previewMode ? "secondary" : "outline"}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDocx}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHtml}>
                  <Code className="mr-2 h-4 w-4" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJson}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Export Template (JSON)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyTemplateJson}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Template JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="hero" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className={cn("grid gap-6", previewMode ? "" : "lg:grid-cols-2")}>
          {/* Editor with Drag & Drop */}
          {!previewMode && (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedSections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedSections.map((section) => (
                    <DraggableSection
                      key={section.id}
                      section={section}
                      icon={sectionIcons[section.type]}
                      label={sectionLabels[section.type]}
                      isExpanded={expandedSection === section.id}
                      isHidden={hiddenSections.has(section.id)}
                      onToggle={() => setExpandedSection(expandedSection === section.id ? "" : section.id)}
                      onDelete={() => deleteSection(section.id)}
                      onToggleVisibility={() => toggleSectionVisibility(section.id)}
                    >
                      <SectionEditorContent
                        section={section}
                        onUpdate={(content) => updateSection(section.id, content)}
                      />
                    </DraggableSection>
                  ))}
                </SortableContext>
              </DndContext>
              
              <AddSectionDropdown
                existingSections={resume.sections.map(s => s.type)}
                onAddSection={addSection}
              />
            </div>
          )}

          {/* Preview */}
          <div className={cn("sticky top-8", previewMode ? "max-w-3xl mx-auto w-full" : "")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Live Preview</h3>
              <Badge variant="secondary">
                {resume.tier.toUpperCase()}
              </Badge>
            </div>
            {showHistory && (
              <div className="mb-4">
                <VersionHistory
                  versions={versions}
                  currentVersionIndex={currentVersionIndex}
                  onRestore={handleRestoreVersion}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onClose={() => setShowHistory(false)}
                />
              </div>
            )}
            {showVersionComparison && versions.length > 1 && (
              <div className="mb-4">
                <VersionComparison
                  versions={versions}
                  currentVersionIndex={currentVersionIndex}
                  onClose={() => setShowVersionComparison(false)}
                />
              </div>
            )}
            {showStyleCustomizer && (
              <div className="mb-4">
                <StyleCustomizer
                  style={resumeStyle}
                  onChange={setResumeStyle}
                  onClose={() => setShowStyleCustomizer(false)}
                />
              </div>
            )}
            {showScoreIndicator && (
              <div className="mb-4">
                <ResumeScoreIndicator 
                  resume={resume} 
                  onAddSection={addSection}
                  onClose={() => setShowScoreIndicator(false)} 
                />
              </div>
            )}
            {showAnalyzer && (
              <div className="mb-4">
                <ResumeAnalyzer resume={resume} onClose={() => setShowAnalyzer(false)} />
              </div>
            )}
            {showWritingAssistant && (
              <div className="mb-4">
                <AIWritingAssistant 
                  text={(() => {
                    const summarySection = resume.sections.find(s => s.type === "summary");
                    return (summarySection?.content as string) || "";
                  })()}
                  sectionType="summary"
                  onClose={() => setShowWritingAssistant(false)} 
                />
              </div>
            )}
            <ResumePreview resume={resume} previewRef={previewRef} style={resumeStyle} hiddenSections={hiddenSections} />
          </div>
        </div>
      </div>

      {/* Template Selector Dialog */}
      <TemplateSelector
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
        onSelectTemplate={handleSelectTemplate}
        currentTier={resume.tier}
      />
    </DashboardLayout>
  );
}
