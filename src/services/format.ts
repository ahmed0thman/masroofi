export function formatCurrency(amount: number, symbol: string = 'E£'): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ${symbol}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K ${symbol}`;
  }
  return `${amount.toFixed(2)} ${symbol}`;
}

export function formatFullCurrency(amount: number, locale: string = 'ar-EG', symbol: string = 'ج.م'): string {
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedNumber} ${symbol}`;
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
