import { Prisma } from '@generated-prisma';

import { DateRangeInput } from '@/modules/shared/application/filters';

const toDateTimeFilter = (range?: DateRangeInput): Prisma.DateTimeFilter | undefined => {
  if (!range || (!range.startDate && !range.endDate)) {
    return undefined;
  }

  const filter: Prisma.DateTimeFilter = {};

  if (range.startDate) {
    filter.gte = range.startDate;
  }

  if (range.endDate) {
    filter.lte = range.endDate;
  }

  return filter;
};

export { toDateTimeFilter };
