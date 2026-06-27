import { getCurrentWeekPeriod } from '@/services/analytics';

describe('getCurrentWeekPeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns Friday to Thursday for a Wednesday', () => {
    // 2025-06-18 is a Wednesday
    jest.setSystemTime(new Date('2025-06-18T12:00:00Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    expect(startDate.getDay()).toBe(5); // Friday
    expect(endDate.getDay()).toBe(4); // Thursday
  });

  it('returns Friday to Thursday for a Friday', () => {
    // 2025-06-20 is a Friday
    jest.setSystemTime(new Date('2025-06-20T12:00:00Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    expect(startDate.getDate()).toBe(20);
    expect(startDate.getDay()).toBe(5); // Friday
  });

  it('returns Friday to Thursday for a Thursday', () => {
    // 2025-06-19 is a Thursday
    jest.setSystemTime(new Date('2025-06-19T12:00:00Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    expect(startDate.getDate()).toBe(13); // previous Friday
    expect(startDate.getDay()).toBe(5); // Friday
    expect(endDate.getDate()).toBe(19); // this Thursday
    expect(endDate.getDay()).toBe(4); // Thursday
  });

  it('returns Friday to Thursday for a Monday', () => {
    // 2025-06-16 is a Monday
    jest.setSystemTime(new Date('2025-06-16T12:00:00Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    expect(startDate.getDate()).toBe(13); // previous Friday
    expect(startDate.getDay()).toBe(5); // Friday
    expect(endDate.getDate()).toBe(19); // next Thursday
    expect(endDate.getDay()).toBe(4); // Thursday
  });

  it('returns start at midnight and end at end of day', () => {
    jest.setSystemTime(new Date('2025-06-18T15:30:45Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(startDate.getSeconds()).toBe(0);
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
    expect(endDate.getSeconds()).toBe(59);
  });

  it('returns the week containing a Saturday', () => {
    // 2025-06-21 is a Saturday
    jest.setSystemTime(new Date('2025-06-21T12:00:00Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    expect(startDate.getDate()).toBe(20); // Friday
    expect(endDate.getDate()).toBe(26); // Thursday
  });

  it('returns the week containing a Sunday', () => {
    // 2025-06-22 is a Sunday
    jest.setSystemTime(new Date('2025-06-22T12:00:00Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    expect(startDate.getDate()).toBe(20); // Friday
    expect(endDate.getDate()).toBe(26); // Thursday
  });

  it('handles month boundaries', () => {
    // June 30 2025 is a Monday
    jest.setSystemTime(new Date('2025-06-30T12:00:00Z'));
    const result = getCurrentWeekPeriod();
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    expect(startDate.getDate()).toBe(27); // Friday June 27
    expect(startDate.getMonth()).toBe(5); // June
    expect(endDate.getDate()).toBe(3); // Thursday July 3
    expect(endDate.getMonth()).toBe(6); // July
  });
});
