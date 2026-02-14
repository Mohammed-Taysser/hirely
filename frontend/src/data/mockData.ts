import { Resume, Company, ScheduledEmail, ActivityLog, UserProfile, Tier } from '@/types';

export const mockResumes: Resume[] = [
  {
    id: '1',
    title: 'Software Engineer Resume',
    tier: 'premium',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    sections: [
      {
        id: 's1',
        type: 'contact',
        title: 'Contact Information',
        order: 0,
        content: {
          fullName: 'Alex Johnson',
          email: 'alex.johnson@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/alexjohnson',
          website: 'alexjohnson.dev',
        },
      },
      {
        id: 's2',
        type: 'summary',
        title: 'Professional Summary',
        order: 1,
        content: 'Passionate software engineer with 5+ years of experience building scalable web applications. Expert in React, TypeScript, and Node.js with a proven track record of delivering high-quality products.',
      },
      {
        id: 's3',
        type: 'experience',
        title: 'Work Experience',
        order: 2,
        content: [
          {
            id: 'e1',
            company: 'Tech Corp',
            position: 'Senior Software Engineer',
            startDate: '2022-01',
            current: true,
            description: 'Leading frontend development for enterprise applications',
            highlights: ['Led migration to React 18', 'Improved performance by 40%', 'Mentored 3 junior developers'],
          },
          {
            id: 'e2',
            company: 'StartupXYZ',
            position: 'Software Engineer',
            startDate: '2019-06',
            endDate: '2021-12',
            current: false,
            description: 'Full-stack development for B2B SaaS platform',
            highlights: ['Built real-time collaboration features', 'Integrated third-party APIs'],
          },
        ],
      },
      {
        id: 's4',
        type: 'skills',
        title: 'Skills',
        order: 3,
        content: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL'],
      },
    ],
  },
  {
    id: '2',
    title: 'Product Manager Resume',
    tier: 'pro',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    sections: [],
  },
  {
    id: '3',
    title: 'Data Analyst Resume',
    tier: 'free',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    sections: [],
  },
];

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Google',
    domain: 'google.com',
    description: 'A multinational technology company specializing in search, cloud computing, and AI.',
    industry: 'Technology',
    size: '10,000+',
    location: 'Mountain View, CA',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Microsoft',
    domain: 'microsoft.com',
    description: 'Global technology corporation developing software, hardware, and cloud services.',
    industry: 'Technology',
    size: '10,000+',
    location: 'Redmond, WA',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Stripe',
    domain: 'stripe.com',
    description: 'Financial infrastructure platform for the internet economy.',
    industry: 'Fintech',
    size: '5,000-10,000',
    location: 'San Francisco, CA',
    createdAt: new Date('2024-01-03'),
  },
];

export const mockEmails: ScheduledEmail[] = [
  {
    id: '1',
    resumeId: '1',
    companyId: '1',
    scheduledFor: new Date('2024-01-25T09:00:00'),
    status: 'scheduled',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    resumeId: '1',
    companyId: '2',
    scheduledFor: new Date('2024-01-22T14:00:00'),
    status: 'sent',
    sentAt: new Date('2024-01-22T14:00:00'),
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    resumeId: '2',
    companyId: '3',
    scheduledFor: new Date('2024-01-21T10:00:00'),
    status: 'delivered',
    sentAt: new Date('2024-01-21T10:00:00'),
    createdAt: new Date('2024-01-15'),
  },
];

export const mockActivities: ActivityLog[] = [
  {
    id: '1',
    type: 'resume_created',
    description: 'Created "Software Engineer Resume"',
    createdAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    type: 'email_scheduled',
    description: 'Scheduled email to Google',
    createdAt: new Date('2024-01-20T15:45:00'),
  },
  {
    id: '3',
    type: 'resume_updated',
    description: 'Updated "Software Engineer Resume"',
    createdAt: new Date('2024-01-20T16:00:00'),
  },
  {
    id: '4',
    type: 'email_sent',
    description: 'Email sent to Microsoft',
    createdAt: new Date('2024-01-22T14:00:00'),
  },
];

export const mockUserProfile: UserProfile = {
  id: '1',
  email: 'user@example.com',
  name: 'Alex Johnson',
  tier: 'pro',
  storageUsed: 45,
  storageLimit: 100,
  resumeCount: 3,
  resumeLimit: 10,
  createdAt: new Date('2024-01-01'),
};

export const tierLimits: Record<Tier, { resumes: number; storage: number; exports: string[] }> = {
  free: { resumes: 2, storage: 25, exports: ['PDF'] },
  pro: { resumes: 10, storage: 100, exports: ['PDF', 'DOCX'] },
  premium: { resumes: -1, storage: 500, exports: ['PDF', 'DOCX', 'HTML'] },
};
