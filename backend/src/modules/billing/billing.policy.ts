export const canBulkApply = (planCode: string) => planCode === "PRO";

export const withinDailyUploadLimit = (limitBytes: number, currentBytes: number, nextBytes: number) =>
  currentBytes + nextBytes <= limitBytes;
