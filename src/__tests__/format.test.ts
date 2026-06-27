import { formatAmount, formatRelativeTime } from '@/lib/format';

describe('formatAmount', () => {
  it('formats amount with Arabic locale', () => {
    const result = formatAmount(500, 'EGP');
    expect(result.amount).toBe('٥٠٠'); // Arabic-Indic digits
    expect(result.suffix).toBe('ج.م');
  });

  it('formats large amounts correctly', () => {
    const result = formatAmount(15000, 'EGP');
    expect(result.amount).toBe('١٥٬٠٠٠');
    expect(result.suffix).toBe('ج.م');
  });

  it('formats zero', () => {
    const result = formatAmount(0, 'EGP');
    expect(result.amount).toBe('٠');
    expect(result.suffix).toBe('ج.م');
  });

  it('formats negative amounts (if ever used)', () => {
    const result = formatAmount(-100, 'EGP');
    expect(result.amount).toBe('؜-١٠٠');
    expect(result.suffix).toBe('ج.م');
  });

  it('formats decimal amounts (rounded to 0 fraction digits)', () => {
    const result = formatAmount(99.7, 'EGP');
    expect(result.amount).toBe('١٠٠');
    expect(result.suffix).toBe('ج.م');
  });

  it('always returns suffix regardless of currency', () => {
    const result = formatAmount(100, 'USD');
    expect(result.suffix).toBe('ج.م');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "الآن" for current time', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('الآن');
  });

  it('returns "Just now" for English locale', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now, 'en')).toBe('Just now');
  });

  it('returns minutes for less than 60 minutes', () => {
    const past = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(past)).toBe('5 د');
  });

  it('returns minutes for English locale', () => {
    const past = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(past, 'en')).toBe('5 m');
  });

  it('returns hours for less than 24 hours', () => {
    const past = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeTime(past)).toBe('3 س');
  });

  it('returns hours for English locale', () => {
    const past = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeTime(past, 'en')).toBe('3 h');
  });

  it('returns "أمس" for yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 3600000).toISOString();
    expect(formatRelativeTime(yesterday)).toBe('أمس');
  });

  it('returns "Yesterday" for English locale yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 3600000).toISOString();
    expect(formatRelativeTime(yesterday, 'en')).toBe('Yesterday');
  });

  it('returns days for less than 7 days', () => {
    const past = new Date(Date.now() - 3 * 24 * 3600000).toISOString();
    expect(formatRelativeTime(past)).toBe('3 ي');
  });

  it('returns weeks for less than 5 weeks', () => {
    const past = new Date(Date.now() - 14 * 24 * 3600000).toISOString();
    expect(formatRelativeTime(past)).toBe('2 أ');
  });

  it('returns "شهر" for exactly 1 month', () => {
    // 35 days = 5 weeks, so diffMonths = 1
    const past = new Date(Date.now() - 35 * 24 * 3600000).toISOString();
    expect(formatRelativeTime(past)).toBe('شهر');
  });

  it('returns "1 month" for English locale for 1 month', () => {
    // 35 days = 5 weeks, so diffMonths = 1
    const past = new Date(Date.now() - 35 * 24 * 3600000).toISOString();
    expect(formatRelativeTime(past, 'en')).toBe('1 month');
  });

  it('returns formatted date for older dates', () => {
    const past = new Date('2025-01-15T12:00:00Z').toISOString();
    const result = formatRelativeTime(past);
    expect(result).toContain('ينا'); // January in Arabic
  });

  it('returns empty string for invalid date', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });

  it('handles edge case of 1 minute diff', () => {
    // 59 seconds = "الآن", 60 seconds = "1 د"
    const past = new Date(Date.now() - 60000).toISOString(); // exactly 1 minute
    expect(formatRelativeTime(past)).toBe('1 د');
  });

  it('handles future dates', () => {
    const future = new Date(Date.now() + 3600000).toISOString();
    const result = formatRelativeTime(future);
    // should still give some result (diffMinutes would be negative → treated as < 1)
    expect(result).toBe('الآن');
  });
});
