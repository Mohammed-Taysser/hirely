import { ResumeData, ResumeSection } from '@hirely/resume-core';

type ResumeDataInput = {
  meta: {
    title: string;
    language?: string | null;
  };
  sections: Record<
    string,
    {
      type: 'summary' | 'experience';
      content: {
        text?: string;
        company?: string;
        role?: string;
        startDate?: string | Date | null;
        endDate?: string | Date | null;
      };
    }
  >;
};

const toIsoString = (value?: string | Date | null) => {
  if (!value) return value ?? null;
  return value instanceof Date ? value.toISOString() : value;
};

const normalizeResumeSection = (section: ResumeDataInput['sections'][string]): ResumeSection => {
  if (section.type === 'summary') {
    return {
      type: 'summary',
      content: {
        text: section.content.text ?? '',
      },
    };
  }

  return {
    type: 'experience',
    content: {
      company: section.content.company ?? '',
      role: section.content.role ?? '',
      startDate: toIsoString(section.content.startDate),
      endDate: toIsoString(section.content.endDate),
    },
  };
};

const normalizeResumeData = (data: ResumeDataInput): ResumeData => {
  const normalizedSections: Record<string, ResumeSection> = {};

  for (const [key, section] of Object.entries(data.sections)) {
    normalizedSections[key] = normalizeResumeSection(section);
  }

  return {
    meta: {
      title: data.meta.title,
      language: data.meta.language ?? null,
    },
    sections: normalizedSections,
  };
};

export { normalizeResumeData };
export type { ResumeDataInput };
