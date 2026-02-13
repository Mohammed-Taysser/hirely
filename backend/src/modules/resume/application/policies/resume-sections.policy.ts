type ResumeSections = Record<string, unknown> | null | undefined;

const countResumeSections = (sections: ResumeSections): number =>
  Object.keys(sections ?? {}).length;

const exceedsResumeSectionsLimit = (sections: ResumeSections, maxSections: number): boolean =>
  countResumeSections(sections) > maxSections;

const buildResumeSectionsLimitErrorMessage = (maxSections: number): string =>
  `Max sections per resume is ${maxSections}`;

export { buildResumeSectionsLimitErrorMessage, countResumeSections, exceedsResumeSectionsLimit };
