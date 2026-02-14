/**
 * Unified Template Schema
 * 
 * This schema serves as the single source of truth for resume templates,
 * used by both frontend rendering and backend PDF generation.
 * 
 * When sending resumes to backend for PDF generation via email,
 * include the complete TemplateConfig alongside the resume data.
 */

import { SectionType } from "@/types";

// Section rendering configuration
export interface SectionRenderConfig {
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
}

// Typography configuration
export interface TypographyConfig {
  fontFamily: string;
  fontSize: number; // base font size in px
  lineHeight: number; // multiplier
  headerFontFamily?: string;
}

// Color scheme configuration
export interface ColorScheme {
  primary: string; // HSL or hex
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
}

// Layout configuration
export interface LayoutConfig {
  headerStyle: 'centered' | 'left' | 'compact' | 'split';
  sectionSpacing: number; // in rem or px
  contentPadding: number;
  borderStyle: 'none' | 'line' | 'accent' | 'boxed';
  showIcons: boolean;
  columnsLayout?: 'single' | 'two-column' | 'sidebar';
}

// Complete template configuration
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string; // Schema version for compatibility
  tier: 'free' | 'pro' | 'premium';
  
  // Visual styling
  typography: TypographyConfig;
  colors: ColorScheme;
  layout: LayoutConfig;
  
  // Section configuration
  sections: SectionRenderConfig[];
  
  // Preview styling (for template selector UI)
  preview: {
    thumbnail: string;
    headerBg: string;
    headerText: string;
    accentBorder: string;
    bodyBg: string;
  };
}

// Section metadata for the template system
export const SECTION_METADATA: Record<SectionType, { 
  label: string; 
  icon: string; 
  defaultTitle: string;
  category: 'header' | 'content' | 'skills' | 'additional';
}> = {
  contact: { 
    label: 'Contact Information', 
    icon: 'User', 
    defaultTitle: 'Contact Information',
    category: 'header'
  },
  summary: { 
    label: 'Professional Summary', 
    icon: 'FileText', 
    defaultTitle: 'Professional Summary',
    category: 'header'
  },
  experience: { 
    label: 'Work Experience', 
    icon: 'Briefcase', 
    defaultTitle: 'Work Experience',
    category: 'content'
  },
  education: { 
    label: 'Education', 
    icon: 'GraduationCap', 
    defaultTitle: 'Education',
    category: 'content'
  },
  skills: { 
    label: 'Skills', 
    icon: 'Code', 
    defaultTitle: 'Skills',
    category: 'skills'
  },
  projects: { 
    label: 'Projects', 
    icon: 'Code', 
    defaultTitle: 'Projects',
    category: 'content'
  },
  certifications: { 
    label: 'Certifications', 
    icon: 'Award', 
    defaultTitle: 'Certifications',
    category: 'additional'
  },
  courses: { 
    label: 'Courses & Training', 
    icon: 'BookOpen', 
    defaultTitle: 'Courses & Training',
    category: 'additional'
  },
  languages: { 
    label: 'Languages', 
    icon: 'Languages', 
    defaultTitle: 'Languages',
    category: 'skills'
  },
  volunteer: { 
    label: 'Volunteer Experience', 
    icon: 'Heart', 
    defaultTitle: 'Volunteer Experience',
    category: 'additional'
  },
  publications: { 
    label: 'Publications', 
    icon: 'BookOpen', 
    defaultTitle: 'Publications',
    category: 'additional'
  },
  references: {
    label: 'References',
    icon: 'Users',
    defaultTitle: 'References',
    category: 'additional'
  },
  awards: {
    label: 'Awards & Honors',
    icon: 'Trophy',
    defaultTitle: 'Awards & Honors',
    category: 'additional'
  },
};

// Default template configurations
export const DEFAULT_TEMPLATE_CONFIG: Omit<TemplateConfig, 'id' | 'name' | 'description' | 'tier' | 'preview' | 'sections'> = {
  version: '1.0.0',
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    headerFontFamily: 'Inter, sans-serif',
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#3b82f6',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
  },
  layout: {
    headerStyle: 'centered',
    sectionSpacing: 1.5,
    contentPadding: 2,
    borderStyle: 'accent',
    showIcons: true,
    columnsLayout: 'single',
  },
};

// Helper to generate PDF-ready config
export function generatePdfConfig(template: TemplateConfig, customStyle?: {
  accentColor?: string;
  fontFamily?: string;
  fontSize?: number;
  spacing?: number;
  headerStyle?: string;
}) {
  return {
    ...template,
    typography: {
      ...template.typography,
      fontFamily: customStyle?.fontFamily || template.typography.fontFamily,
      fontSize: customStyle?.fontSize || template.typography.fontSize,
      lineHeight: customStyle?.spacing === 0.5 ? 1.3 : customStyle?.spacing === 1 ? 1.5 : customStyle?.spacing === 1.5 ? 1.7 : template.typography.lineHeight,
    },
    colors: {
      ...template.colors,
      accent: customStyle?.accentColor || template.colors.accent,
      primary: customStyle?.accentColor || template.colors.primary,
    },
    layout: {
      ...template.layout,
      headerStyle: (customStyle?.headerStyle as LayoutConfig['headerStyle']) || template.layout.headerStyle,
    },
  };
}

// Serialize template for API/backend consumption
export function serializeTemplateForBackend(config: TemplateConfig): string {
  return JSON.stringify(config);
}

// Parse template from API/backend
export function parseTemplateFromBackend(json: string): TemplateConfig {
  return JSON.parse(json) as TemplateConfig;
}
