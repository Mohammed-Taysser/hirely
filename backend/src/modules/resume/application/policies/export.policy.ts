const EXPORT_EXPIRY_DAYS_FREE = 30;
const EXPORT_EXPIRY_DAYS_PAID = 90;

const canDirectDownload = (planCode: string) => planCode === 'PRO' || planCode === 'PLUS';

const getExportExpiryDays = (planCode: string) =>
  planCode === 'FREE' ? EXPORT_EXPIRY_DAYS_FREE : EXPORT_EXPIRY_DAYS_PAID;

export { canDirectDownload, getExportExpiryDays };
