import dateService from '@dist/modules/shared/presentation/date.service';

describe('date.service', () => {
  it('returns undefined for empty range input', () => {
    expect(dateService.buildDateRangeFilter()).toBeUndefined();
    expect(dateService.buildDateRangeFilter({})).toBeUndefined();
  });

  it('builds normalized range for start and end dates', () => {
    const rawDayjs = dateService.raw();
    const range = dateService.buildDateRangeFilter({
      startDate: new Date('2026-02-01T12:00:00.000Z'),
      endDate: new Date('2026-02-10T12:00:00.000Z'),
    });

    expect(range?.startDate).toBeInstanceOf(Date);
    expect(range?.endDate).toBeInstanceOf(Date);
    expect(range?.startDate?.getTime()).toBe(
      rawDayjs('2026-02-01T12:00:00.000Z').startOf('day').toDate().getTime()
    );
    expect(range?.endDate?.getTime()).toBe(
      rawDayjs('2026-02-10T12:00:00.000Z').endOf('day').toDate().getTime()
    );
  });

  it('builds range with start date only', () => {
    const rawDayjs = dateService.raw();
    const range = dateService.buildDateRangeFilter({
      startDate: new Date('2026-02-01T12:00:00.000Z'),
    });

    expect(range?.startDate?.getTime()).toBe(
      rawDayjs('2026-02-01T12:00:00.000Z').startOf('day').toDate().getTime()
    );
    expect(range?.endDate).toBeUndefined();
  });

  it('builds range with end date only', () => {
    const rawDayjs = dateService.raw();
    const range = dateService.buildDateRangeFilter({
      endDate: new Date('2026-02-10T12:00:00.000Z'),
    });

    expect(range?.startDate).toBeUndefined();
    expect(range?.endDate?.getTime()).toBe(
      rawDayjs('2026-02-10T12:00:00.000Z').endOf('day').toDate().getTime()
    );
  });

  it('returns dayjs instance in configured timezone via tz()', () => {
    const date = dateService.tz('2026-02-10T10:00:00.000Z');
    expect(date.isValid()).toBe(true);
  });

  it('exposes timezone and raw dayjs accessor', () => {
    expect(typeof dateService.getTimezone()).toBe('string');
    expect(typeof dateService.raw()).toBe('function');
  });
});
