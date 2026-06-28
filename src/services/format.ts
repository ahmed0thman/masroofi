import type { CurrencyRow } from '@/db/currency-repo';

/**
 * Unified currency formatting function.
 * Formats an amount using the locale-appropriate symbol from a CurrencyRow.
 */
export function formatCurrency(amount: number, currency: CurrencyRow, locale: string = 'ar'): string {
  const symbol = locale === 'ar' ? currency.symbol : (currency.symbol_en || currency.symbol);
  const numberLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const formattedNumber = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formattedNumber} ${symbol}`;
}

/**
 * Legacy-compatible short form: formats with compact notation and a symbol string.
 * Prefer formatCurrency(amount, currencyRow, locale) for new code.
 */
function formatArabicIndic(n: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatCurrencyShort(amount: number, symbol: string = '', locale: string = 'ar'): string {
  if (locale === 'ar') {
    if (amount >= 1_000_000) {
      return `${formatArabicIndic(amount / 1_000_000, 1)} مليون ${symbol}`;
    }
    if (amount >= 1_000) {
      return `${formatArabicIndic(amount / 1_000, 1)} الف ${symbol}`;
    }
    return `${formatArabicIndic(amount, 0)} ${symbol}`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ${symbol}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K ${symbol}`;
  }
  return `${amount.toFixed(0)} ${symbol}`;
}

/**
 * Formats a full amount with Intl.NumberFormat using a CurrencyRow.
 * Alias for formatCurrency for semantic clarity.
 */
export function formatFullCurrency(amount: number, currency: CurrencyRow, locale: string = 'ar'): string {
  return formatCurrency(amount, currency, locale);
}

export function formatNumber(n: number, locale: string = 'ar'): string {
  if (locale === 'ar') {
    if (n >= 1_000_000) return `${formatArabicIndic(n / 1_000_000, 1)} مليون`;
    if (n >= 1_000) return `${formatArabicIndic(n / 1_000, 1)} الف`;
    return formatArabicIndic(n, 0);
  }
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatShortCurrency(amount: number, locale: string = 'ar'): string {
  if (locale === 'ar') {
    if (amount >= 1_000_000) return `${formatArabicIndic(amount / 1_000_000, 1)} مليون`;
    if (amount >= 1_000) return `${formatArabicIndic(amount / 1_000, 1)} الف`;
    return formatArabicIndic(amount, 0);
  }
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toFixed(0);
}

export function getMonthName(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] ?? 'Friday';
}

export function getDayNameArabic(day: number): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[day] ?? 'الجمعة';
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}
