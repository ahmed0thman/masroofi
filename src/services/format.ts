import type { CurrencyRow } from '@/db/currency-repo';

/**
 * Unified currency formatting function.
 * Formats an amount using the locale-appropriate symbol from a CurrencyRow.
 */
export function formatCurrency(amount: number, currency: CurrencyRow, locale: string = 'ar'): string {
  const symbol = locale === 'ar' ? currency.symbol : (currency.symbol_en || currency.symbol);
  const numberLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const formattedNumber = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedNumber} ${symbol}`;
}

/**
 * Legacy-compatible short form: formats with compact notation and a symbol string.
 * Prefer formatCurrency(amount, currencyRow, locale) for new code.
 */
export function formatCurrencyShort(amount: number, symbol: string = ''): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ${symbol}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K ${symbol}`;
  }
  return `${amount.toFixed(2)} ${symbol}`;
}

/**
 * Formats a full amount with Intl.NumberFormat using a CurrencyRow.
 * Alias for formatCurrency for semantic clarity.
 */
export function formatFullCurrency(amount: number, currency: CurrencyRow, locale: string = 'ar'): string {
  return formatCurrency(amount, currency, locale);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatShortCurrency(amount: number): string {
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
