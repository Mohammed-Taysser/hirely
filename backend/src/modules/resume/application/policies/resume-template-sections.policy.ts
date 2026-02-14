import { ResumeData, ResumeSection } from '@hirely/resume-core';

type ResumeSectionType = ResumeSection['type'];

const REQUIRED_SECTIONS_BY_TEMPLATE: Record<string, ResumeSectionType[]> = {
  classic: ['summary'],
  modern: ['summary'],
  minimalist: ['summary'],
};

const getRequiredSectionsForTemplate = (templateId: string): ResumeSectionType[] =>
  REQUIRED_SECTIONS_BY_TEMPLATE[templateId] ?? [];

const getResumeSectionTypes = (data: ResumeData): Set<ResumeSectionType> => {
  const types = new Set<ResumeSectionType>();

  for (const section of Object.values(data.sections ?? {})) {
    types.add(section.type);
  }

  return types;
};

const getMissingRequiredSections = (templateId: string, data: ResumeData): ResumeSectionType[] => {
  const required = getRequiredSectionsForTemplate(templateId);
  const available = getResumeSectionTypes(data);

  return required.filter((sectionType) => !available.has(sectionType));
};

const hasRequiredSectionsForTemplate = (templateId: string, data: ResumeData): boolean =>
  getMissingRequiredSections(templateId, data).length === 0;

const buildMissingRequiredSectionsErrorMessage = (
  templateId: string,
  missingSections: ResumeSectionType[]
): string => `Template "${templateId}" requires sections: ${missingSections.join(', ')}`;

export {
  buildMissingRequiredSectionsErrorMessage,
  getMissingRequiredSections,
  getRequiredSectionsForTemplate,
  getResumeSectionTypes,
  hasRequiredSectionsForTemplate,
};
