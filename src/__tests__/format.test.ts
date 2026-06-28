import { formatAmount, formatRelativeTime } from '@/lib/format';
import {
  formatCurrency,
  formatCurrencyShort,
  formatFullCurrency,
  formatNumber,
  getMonthName,
  getDayName,
  getDayNameArabic,
  getCurrentMonth,
  getCurrentYear,
} from '@/services/format';
import type { CurrencyRow } from '@/db/currency-repo';

const mockEGP: CurrencyRow = {
  id: 1,
  code: 'EGP',
  name_ar: 'جنيه مصري',
  name_en: 'Egyptian Pound',
  symbol: 'ج.م',
  symbol_en: 'EGP',
  is_default: 1,
};

const mockUSD: CurrencyRow = {
  id: 2,
  code: 'USD',
  name_ar: 'دولار أمريكي',
  name_en: 'US Dollar',
  symbol: '$',
  symbol_en: '$',
  is_default: 0,
};

const mockSAR: CurrencyRow = {
  id: 3,
  code: 'SAR',
  name_ar: 'ريال سعودي',
  name_en: 'Saudi Riyal',
  symbol: 'ر.س',
  symbol_en: 'SAR',
  is_default: 0,
};

const mockAED: CurrencyRow = {
  id: 4,
  code: 'AED',
  name_ar: 'درهم إماراتي',
  name_en: 'UAE Dirham',
  symbol: 'د.إ',
  symbol_en: 'AED',
  is_default: 0,
};

const mockQAR: CurrencyRow = {
  id: 5,
  code: 'QAR',
  name_ar: 'ريال قطري',
  name_en: 'Qatari Riyal',
  symbol: 'ر.ق',
  symbol_en: 'QAR',
  is_default: 0,
};

const mockKWD: CurrencyRow = {
  id: 6,
  code: 'KWD',
  name_ar: 'دينار كويتي',
  name_en: 'Kuwaiti Dinar',
  symbol: 'د.ك',
  symbol_en: 'KWD',
  is_default: 0,
};

const mockBHD: CurrencyRow = {
  id: 7,
  code: 'BHD',
  name_ar: 'دينار بحريني',
  name_en: 'Bahraini Dinar',
  symbol: 'د.ب',
  symbol_en: 'BHD',
  is_default: 0,
};

const mockOMR: CurrencyRow = {
  id: 8,
  code: 'OMR',
  name_ar: 'ريال عماني',
  name_en: 'Omani Rial',
  symbol: 'ر.ع',
  symbol_en: 'OMR',
  is_default: 0,
};

const mockEUR: CurrencyRow = {
  id: 9,
  code: 'EUR',
  name_ar: 'يورو',
  name_en: 'Euro',
  symbol: '€',
  symbol_en: '€',
  is_default: 0,
};

describe('formatAmount', () => {
  it('formats amount with Arabic locale and symbol', () => {
    const result = formatAmount(500, 'ج.م', 'ar');
    expect(result.amount).toBe('٥٠٠'); // Arabic-Indic digits
    expect(result.suffix).toBe('ج.م');
  });

  it('formats amount with English locale and symbol', () => {
    const result = formatAmount(500, 'EGP', 'en');
    expect(result.amount).toBe('500');
    expect(result.suffix).toBe('EGP');
  });

  it('formats large amounts correctly', () => {
    const result = formatAmount(15000, 'ج.م', 'ar');
    expect(result.amount).toBe('١٥٬٠٠٠');
    expect(result.suffix).toBe('ج.م');
  });

  it('formats zero', () => {
    const result = formatAmount(0, 'ج.م', 'ar');
    expect(result.amount).toBe('٠');
    expect(result.suffix).toBe('ج.م');
  });

  it('formats decimal amounts (rounded to 0 fraction digits)', () => {
    const result = formatAmount(99.7, 'ج.م', 'ar');
    expect(result.amount).toBe('١٠٠');
    expect(result.suffix).toBe('ج.م');
  });
});

describe('formatCurrency (unified)', () => {
  it('formats with Arabic symbol for ar locale', () => {
    const result = formatCurrency(500, mockEGP, 'ar');
    expect(result).toContain('ج.م');
    expect(result).toContain('٥٠٠');
  });

  it('formats with English symbol for en locale', () => {
    const result = formatCurrency(500, mockEGP, 'en');
    expect(result).toContain('EGP');
    expect(result).toContain('500');
  });

  it('formats SAR correctly in Arabic', () => {
    const result = formatCurrency(100, mockSAR, 'ar');
    expect(result).toContain('ر.س');
    expect(result).toContain('١٠٠');
  });

  it('formats SAR correctly in English', () => {
    const result = formatCurrency(100, mockSAR, 'en');
    expect(result).toContain('SAR');
    expect(result).toContain('100');
  });

  it('formats USD correctly', () => {
    const result = formatCurrency(50.5, mockUSD, 'en');
    expect(result).toContain('$');
    expect(result).toContain('50.50');
  });

  // ── All 9 currencies in both locales ──
  describe('all 9 currencies in Arabic locale', () => {
    const testCases: { currency: CurrencyRow; symbol: string }[] = [
      { currency: mockEGP, symbol: 'ج.م' },
      { currency: mockSAR, symbol: 'ر.س' },
      { currency: mockAED, symbol: 'د.إ' },
      { currency: mockQAR, symbol: 'ر.ق' },
      { currency: mockKWD, symbol: 'د.ك' },
      { currency: mockBHD, symbol: 'د.ب' },
      { currency: mockOMR, symbol: 'ر.ع' },
      { currency: mockUSD, symbol: '$' },
      { currency: mockEUR, symbol: '€' },
    ];

    testCases.forEach(({ currency, symbol }) => {
      it(`formats ${currency.code} in Arabic with symbol ${symbol}`, () => {
        const result = formatCurrency(100, currency, 'ar');
        expect(result).toContain(symbol);
        expect(result).toContain('١٠٠');
      });
    });
  });

  describe('all 9 currencies in English locale', () => {
    const testCases: { currency: CurrencyRow; symbolEn: string }[] = [
      { currency: mockEGP, symbolEn: 'EGP' },
      { currency: mockSAR, symbolEn: 'SAR' },
      { currency: mockAED, symbolEn: 'AED' },
      { currency: mockQAR, symbolEn: 'QAR' },
      { currency: mockKWD, symbolEn: 'KWD' },
      { currency: mockBHD, symbolEn: 'BHD' },
      { currency: mockOMR, symbolEn: 'OMR' },
      { currency: mockUSD, symbolEn: '$' },
      { currency: mockEUR, symbolEn: '€' },
    ];

    testCases.forEach(({ currency, symbolEn }) => {
      it(`formats ${currency.code} in English with symbol ${symbolEn}`, () => {
        const result = formatCurrency(100, currency, 'en');
        expect(result).toContain(symbolEn);
        expect(result).toContain('100');
        expect(result).toContain('.00');
      });
    });
  });

  // ── Edge cases ──
  it('formats zero', () => {
    const result = formatCurrency(0, mockEGP, 'ar');
    expect(result).toContain('٠');
    // Arabic uses U+066B (٫) as decimal separator, not U+002E (.)
    expect(result).toContain('٠٫٠٠');
  });

  it('formats zero in English', () => {
    const result = formatCurrency(0, mockEGP, 'en');
    expect(result).toContain('0.00');
  });

  it('formats negative numbers', () => {
    const result = formatCurrency(-50, mockEGP, 'en');
    expect(result).toContain('-50.00');
  });

  it('formats very large numbers', () => {
    const result = formatCurrency(1_000_000, mockUSD, 'en');
    expect(result).toContain('1,000,000.00');
  });

  it('formats large numbers in Arabic', () => {
    const result = formatCurrency(1_500_000, mockEGP, 'ar');
    expect(result).toContain('ج.م');
    // Should contain Arabic-Indic digits for 1,500,000
    expect(result).toContain('٥٠٠٬٠٠٠');
  });

  it('formats with many decimal places (rounds to 2)', () => {
    const result = formatCurrency(99.999, mockUSD, 'en');
    expect(result).toContain('100.00');
  });

  it('formats with one decimal place', () => {
    const result = formatCurrency(49.5, mockUSD, 'en');
    expect(result).toContain('49.50');
  });

  it('formats fractional amounts', () => {
    const result = formatCurrency(0.01, mockUSD, 'en');
    expect(result).toContain('0.01');
  });
});

describe('formatCurrencyShort', () => {
  it('formats with compact notation', () => {
    expect(formatCurrencyShort(1500, 'ج.م')).toBe('1.5K ج.م');
  });

  it('formats millions', () => {
    expect(formatCurrencyShort(2_500_000, 'EGP')).toBe('2.5M EGP');
  });

  it('formats small amounts', () => {
    expect(formatCurrencyShort(99.5, 'ر.س')).toBe('99.50 ر.س');
  });

  describe('all 9 currencies in formatCurrencyShort', () => {
    const testCases: { symbol: string; code: string }[] = [
      { symbol: 'ج.م', code: 'EGP' },
      { symbol: 'ر.س', code: 'SAR' },
      { symbol: 'د.إ', code: 'AED' },
      { symbol: 'ر.ق', code: 'QAR' },
      { symbol: 'د.ك', code: 'KWD' },
      { symbol: 'د.ب', code: 'BHD' },
      { symbol: 'ر.ع', code: 'OMR' },
      { symbol: '$', code: 'USD' },
      { symbol: '€', code: 'EUR' },
    ];

    testCases.forEach(({ symbol, code }) => {
      it(`formats 1500 with ${code} (${symbol}) as compact`, () => {
        expect(formatCurrencyShort(1500, symbol)).toContain('1.5K');
        expect(formatCurrencyShort(1500, symbol)).toContain(symbol);
      });

      it(`formats 2500000 with ${code} (${symbol}) as compact`, () => {
        expect(formatCurrencyShort(2_500_000, symbol)).toContain('2.5M');
        expect(formatCurrencyShort(2_500_000, symbol)).toContain(symbol);
      });
    });
  });

  // ── Edge cases ──
  it('formats zero with compact notation', () => {
    expect(formatCurrencyShort(0, 'EGP')).toBe('0.00 EGP');
  });

  it('formats negative small number', () => {
    expect(formatCurrencyShort(-50, '$')).toBe('-50.00 $');
  });

  it('formats negative large number', () => {
    // formatCurrencyShort uses simple comparisons (>= 1_000_000), so negative
    // -2000000 < 1000000 → falls through to toFixed(2)
    const result = formatCurrencyShort(-2_000_000, '€');
    expect(result).toBe('-2000000.00 €');
  });

  it('formats with empty symbol', () => {
    expect(formatCurrencyShort(1000, '')).toBe('1.0K ');
  });

  it('formats exactly 999 (below K threshold)', () => {
    expect(formatCurrencyShort(999, 'ج.م')).toBe('999.00 ج.م');
  });

  it('formats exactly 1000 (boundary to K)', () => {
    expect(formatCurrencyShort(1000, 'ج.م')).toBe('1.0K ج.م');
  });

  it('formats exactly 1000000 (boundary to M)', () => {
    expect(formatCurrencyShort(1_000_000, '$')).toBe('1.0M $');
  });
});

describe('formatFullCurrency', () => {
  it('is an alias for formatCurrency', () => {
    expect(formatFullCurrency(100, mockEGP, 'ar')).toBe(formatCurrency(100, mockEGP, 'ar'));
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
    const past = new Date(Date.now() - 35 * 24 * 3600000).toISOString();
    expect(formatRelativeTime(past)).toBe('شهر');
  });

  it('returns "1 month" for English locale for 1 month', () => {
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
    const past = new Date(Date.now() - 60000).toISOString();
    expect(formatRelativeTime(past)).toBe('1 د');
  });

  it('handles future dates', () => {
    const future = new Date(Date.now() + 3600000).toISOString();
    const result = formatRelativeTime(future);
    expect(result).toBe('الآن');
  });
});

// ============================================================
// formatNumber
// ============================================================
describe('formatNumber', () => {
  it('formats small numbers as plain string', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(1000)).toBe('1.0K');
    // 999999 < 1_000_000 so it uses K: (999999/1000).toFixed(1) = "1000.0" + "K"
    expect(formatNumber(999_999)).toBe('1000.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
    expect(formatNumber(10_000_000)).toBe('10.0M');
  });

  it('formats exactly 1000 as K boundary', () => {
    expect(formatNumber(1000)).toBe('1.0K');
  });

  it('formats exactly 1000000 as M boundary', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-500)).toBe('-500');
    // -1500 < 1000 so it returns String(n) = "-1500"
    expect(formatNumber(-1500)).toBe('-1500');
  });
});

// ============================================================
// getMonthName
// ============================================================
describe('getMonthName', () => {
  it('returns correct English month name for January', () => {
    expect(getMonthName('2025-01')).toBe('January 2025');
  });

  it('returns correct English month name for December', () => {
    expect(getMonthName('2025-12')).toBe('December 2025');
  });

  it('returns correct month for mid-year', () => {
    expect(getMonthName('2025-06')).toBe('June 2025');
  });

  it('handles different years', () => {
    expect(getMonthName('2024-02')).toBe('February 2024');
    expect(getMonthName('2026-11')).toBe('November 2026');
  });

  it('handles single-digit month with leading zero', () => {
    expect(getMonthName('2025-03')).toBe('March 2025');
  });
});

// ============================================================
// getDayName
// ============================================================
describe('getDayName', () => {
  it('returns Sunday for index 0', () => {
    expect(getDayName(0)).toBe('Sunday');
  });

  it('returns Monday for index 1', () => {
    expect(getDayName(1)).toBe('Monday');
  });

  it('returns Saturday for index 6', () => {
    expect(getDayName(6)).toBe('Saturday');
  });

  it('returns Friday (fallback) for invalid index', () => {
    expect(getDayName(7)).toBe('Friday');
    expect(getDayName(-1)).toBe('Friday');
  });

  it('returns correct name for each day of week', () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach((name, i) => {
      expect(getDayName(i)).toBe(name);
    });
  });
});

// ============================================================
// getDayNameArabic
// ============================================================
describe('getDayNameArabic', () => {
  it('returns الأحد for index 0', () => {
    expect(getDayNameArabic(0)).toBe('الأحد');
  });

  it('returns الإثنين for index 1', () => {
    expect(getDayNameArabic(1)).toBe('الإثنين');
  });

  it('returns السبت for index 6', () => {
    expect(getDayNameArabic(6)).toBe('السبت');
  });

  it('returns الجمعة (fallback) for invalid index', () => {
    expect(getDayNameArabic(7)).toBe('الجمعة');
    expect(getDayNameArabic(-1)).toBe('الجمعة');
  });

  it('returns correct Arabic name for each day of week', () => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    days.forEach((name, i) => {
      expect(getDayNameArabic(i)).toBe(name);
    });
  });
});

// ============================================================
// getCurrentMonth / getCurrentYear
// ============================================================
describe('getCurrentMonth', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns YYYY-MM format for January', () => {
    jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    expect(getCurrentMonth()).toBe('2025-01');
  });

  it('returns YYYY-MM format for December', () => {
    jest.setSystemTime(new Date('2025-12-01T00:00:00Z'));
    expect(getCurrentMonth()).toBe('2025-12');
  });

  it('pads single-digit month with leading zero', () => {
    jest.setSystemTime(new Date('2025-03-15T12:00:00Z'));
    expect(getCurrentMonth()).toBe('2025-03');
  });

  it('handles double-digit months correctly', () => {
    jest.setSystemTime(new Date('2025-10-01T00:00:00Z'));
    expect(getCurrentMonth()).toBe('2025-10');
  });
});

describe('getCurrentYear', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the current year', () => {
    jest.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    expect(getCurrentYear()).toBe(2025);
  });

  it('returns 2026 for next year', () => {
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    expect(getCurrentYear()).toBe(2026);
  });

  it('returns correct year for mid-year dates', () => {
    jest.setSystemTime(new Date('2024-07-01T12:00:00Z'));
    expect(getCurrentYear()).toBe(2024);
  });
});
