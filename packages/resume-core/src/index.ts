export type ResumeMeta = {
  title: string;
  language?: string | null;
};

export type SummarySection = {
  type: 'summary';
  content: {
    text: string;
  };
};

export type ExperienceSection = {
  type: 'experience';
  content: {
    company: string;
    role: string;
    startDate?: string | null;
    endDate?: string | null;
  };
};

export type ResumeSection = SummarySection | ExperienceSection;

export type ResumeData = {
  meta: ResumeMeta;
  sections: Record<string, ResumeSection>;
};

export type SummaryItemViewModel = {
  type: 'summary';
  text: string;
};

export type ExperienceItemViewModel = {
  type: 'experience';
  company: string;
  role: string;
  startDateLabel?: string;
  endDateLabel?: string;
  isCurrent: boolean;
};

export type ResumeSectionViewModel = SummaryItemViewModel | ExperienceItemViewModel;

export type ResumeViewModel = {
  meta: {
    title: string;
    language?: string | null;
  };
  sections: ResumeSectionViewModel[];
};

export type BuildResumeViewModelOptions = {
  /**
   * Locale used for date formatting. Defaults to 'en'.
   */
  locale?: string;
};

/**
 * Convert raw resume JSON (as stored in the DB) into a normalized
 * view-model structure that templates can consume.
 */
export function buildResumeViewModel(
  data: ResumeData,
  _options: BuildResumeViewModelOptions = {}
): ResumeViewModel {
  const sectionsArray = Object.values(data.sections ?? {}) as ResumeSection[];

  const summaryItems: SummaryItemViewModel[] = [];
  const experienceItems: ExperienceItemViewModel[] = [];

  for (const section of sectionsArray) {
    if (section.type === 'summary') {
      summaryItems.push({
        type: 'summary',
        text: section.content.text,
      });
    } else if (section.type === 'experience') {
      const { company, role, startDate, endDate } = section.content;

      const parsedStart = startDate ? new Date(startDate) : undefined;
      const parsedEnd = endDate ? new Date(endDate) : undefined;

      const isCurrent = !!parsedStart && !parsedEnd;

      const formatYearMonth = (value?: Date) => {
        if (!value) return undefined;
        // YYYY-MM is stable and independent of locale
        const year = value.getUTCFullYear();
        const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
        return `${year}-${month}`;
      };

      experienceItems.push({
        type: 'experience',
        company,
        role,
        startDateLabel: parsedStart ? formatYearMonth(parsedStart) : undefined,
        endDateLabel: parsedEnd ? formatYearMonth(parsedEnd) : isCurrent ? 'Present' : undefined,
        isCurrent,
      });
    }
  }

  // Sort experiences by start date descending when available
  experienceItems.sort((a, b) => {
    const aKey = a.startDateLabel ?? '';
    const bKey = b.startDateLabel ?? '';
    if (aKey === bKey) return 0;
    return aKey > bKey ? -1 : 1;
  });

  return {
    meta: {
      title: data.meta.title,
      language: data.meta.language ?? null,
    },
    sections: [...summaryItems, ...experienceItems],
  };
}

