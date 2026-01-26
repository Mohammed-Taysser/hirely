import { Prisma } from '@generated-prisma';
import dayjs, { ConfigType } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { DateRangeInput } from '../dto/filters.dto';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(isSameOrBefore);

class DateService {
  private readonly timezone: string;

  constructor(timezone?: string) {
    this.timezone = timezone ?? dayjs.tz.guess() ?? 'UTC';
    dayjs.tz.setDefault(this.timezone);
  }

  /** Always returns dayjs instance with app timezone */
  tz(date?: ConfigType) {
    return dayjs(date).tz(this.timezone);
  }

  /** Expose extended dayjs when you need full API */
  raw() {
    return dayjs;
  }

  /** Prisma-friendly date range filter */
  buildDateRangeFilter(dateRange?: DateRangeInput) {
    if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) {
      return undefined;
    }

    const filter: Pick<Prisma.DateTimeFilter, 'gte' | 'lte'> = {};

    if (dateRange.startDate) {
      filter.gte = dayjs(dateRange.startDate).startOf('day').toDate();
    }

    if (dateRange.endDate) {
      filter.lte = dayjs(dateRange.endDate).endOf('day').toDate();
    }

    return filter;
  }

  getTimezone() {
    return this.timezone;
  }
}

export default new DateService();
