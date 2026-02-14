export type Tier = 'free' | 'pro' | 'premium';

export interface Resume {
  id: string;
  title: string;
  tier: Tier;
  createdAt: Date;
  updatedAt: Date;
  sections: ResumeSection[];
}

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  content: SectionContent;
  order: number;
}

export type SectionType = 
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'courses'
  | 'languages'
  | 'volunteer'
  | 'publications'
  | 'references'
  | 'awards';

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface CourseItem {
  id: string;
  name: string;
  provider: string;
  completionDate: string;
  credentialUrl?: string;
  skills?: string[];
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  cause?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  authors: string;
  publisher: string;
  date: string;
  type: 'journal' | 'conference' | 'book' | 'chapter' | 'thesis' | 'patent' | 'whitepaper' | 'blog' | 'other';
  url?: string;
  doi?: string;
  description?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  company: string;
  relationship: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
  url?: string;
}

export type SectionContent = 
  | ContactInfo
  | string
  | ExperienceItem[]
  | EducationItem[]
  | string[]
  | ProjectItem[]
  | CertificationItem[]
  | CourseItem[]
  | LanguageItem[]
  | VolunteerItem[]
  | PublicationItem[]
  | ReferenceItem[]
  | AwardItem[];

export interface Company {
  id: string;
  name: string;
  domain: string;
  description: string;
  logo?: string;
  industry: string;
  size: string;
  location: string;
  createdAt: Date;
}

export interface ScheduledEmail {
  id: string;
  resumeId: string;
  companyId: string;
  scheduledFor: Date;
  status: EmailStatus;
  sentAt?: Date;
  createdAt: Date;
}

export type EmailStatus = 'scheduled' | 'sent' | 'delivered' | 'opened' | 'failed';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type ActivityType = 
  | 'resume_created'
  | 'resume_updated'
  | 'resume_deleted'
  | 'email_scheduled'
  | 'email_sent'
  | 'email_failed'
  | 'company_added';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  storageUsed: number;
  storageLimit: number;
  resumeCount: number;
  resumeLimit: number;
  createdAt: Date;
}
