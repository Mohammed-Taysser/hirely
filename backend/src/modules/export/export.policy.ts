export const canDirectDownload = (planCode: string) =>
  planCode === "PRO" || planCode === "PLUS";
