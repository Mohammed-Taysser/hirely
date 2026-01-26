const BODY_LIMIT = '300kb';

const EXPORT_EXPIRY_DAYS_FREE = 30;
const EXPORT_EXPIRY_DAYS_PAID = 90;

const RATE_LIMIT_EXPORT = {
  windowSeconds: 60,
  max: 5,
};

const RATE_LIMIT_BULK_APPLY = {
  windowSeconds: 60,
  max: 2,
};

const QUEUE_NAMES = {
  pdf: 'pdf-generation',
  email: 'email-delivery',
};

export {
  BODY_LIMIT,
  EXPORT_EXPIRY_DAYS_FREE,
  EXPORT_EXPIRY_DAYS_PAID,
  QUEUE_NAMES,
  RATE_LIMIT_BULK_APPLY,
  RATE_LIMIT_EXPORT,
};
