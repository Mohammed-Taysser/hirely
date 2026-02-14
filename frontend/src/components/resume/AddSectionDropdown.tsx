import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  BookOpen,
  Languages,
  Heart,
  Users,
  Trophy,
} from "lucide-react";
import { SectionType } from "@/types";

interface SectionOption {
  type: SectionType;
  label: string;
  icon: React.ElementType;
  category: "header" | "content" | "skills" | "additional";
}

const sectionOptions: SectionOption[] = [
  { type: "contact", label: "Contact Information", icon: User, category: "header" },
  { type: "summary", label: "Professional Summary", icon: FileText, category: "header" },
  { type: "experience", label: "Work Experience", icon: Briefcase, category: "content" },
  { type: "education", label: "Education", icon: GraduationCap, category: "content" },
  { type: "projects", label: "Projects", icon: Code, category: "content" },
  { type: "skills", label: "Skills", icon: Code, category: "skills" },
  { type: "languages", label: "Languages", icon: Languages, category: "skills" },
  { type: "certifications", label: "Certifications", icon: Award, category: "additional" },
  { type: "courses", label: "Courses & Training", icon: BookOpen, category: "additional" },
  { type: "volunteer", label: "Volunteer Experience", icon: Heart, category: "additional" },
  { type: "publications", label: "Publications", icon: BookOpen, category: "additional" },
  { type: "awards", label: "Awards & Honors", icon: Trophy, category: "additional" },
  { type: "references", label: "References", icon: Users, category: "additional" },
];

interface AddSectionDropdownProps {
  existingSections: SectionType[];
  onAddSection: (type: SectionType) => void;
}

export function AddSectionDropdown({ existingSections, onAddSection }: AddSectionDropdownProps) {
  const availableSections = sectionOptions.filter(
    (option) => !existingSections.includes(option.type)
  );

  const headerSections = availableSections.filter((s) => s.category === "header");
  const contentSections = availableSections.filter((s) => s.category === "content");
  const skillsSections = availableSections.filter((s) => s.category === "skills");
  const additionalSections = availableSections.filter((s) => s.category === "additional");

  if (availableSections.length === 0) {
    return (
      <Button variant="outline" className="w-full border-dashed" disabled>
        <Plus className="mr-2 h-4 w-4" />
        All Sections Added
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full border-dashed">
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56 bg-popover">
        {headerSections.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Header
            </DropdownMenuLabel>
            {headerSections.map((section) => (
              <DropdownMenuItem
                key={section.type}
                onClick={() => onAddSection(section.type)}
                className="cursor-pointer"
              >
                <section.icon className="mr-2 h-4 w-4" />
                {section.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {contentSections.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Content
            </DropdownMenuLabel>
            {contentSections.map((section) => (
              <DropdownMenuItem
                key={section.type}
                onClick={() => onAddSection(section.type)}
                className="cursor-pointer"
              >
                <section.icon className="mr-2 h-4 w-4" />
                {section.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {skillsSections.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Skills & Languages
            </DropdownMenuLabel>
            {skillsSections.map((section) => (
              <DropdownMenuItem
                key={section.type}
                onClick={() => onAddSection(section.type)}
                className="cursor-pointer"
              >
                <section.icon className="mr-2 h-4 w-4" />
                {section.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {additionalSections.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Additional
            </DropdownMenuLabel>
            {additionalSections.map((section) => (
              <DropdownMenuItem
                key={section.type}
                onClick={() => onAddSection(section.type)}
                className="cursor-pointer"
              >
                <section.icon className="mr-2 h-4 w-4" />
                {section.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
