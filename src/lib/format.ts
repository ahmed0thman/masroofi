export function formatAmount(price: number, symbol: string, locale: string = 'ar'): { amount: string; suffix: string } {
  const numberLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const amount = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return { amount, suffix: symbol };
}

export function formatRelativeTime(dateString: string, locale: string = 'ar'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return locale === 'ar' ? 'الآن' : 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} ${locale === 'ar' ? 'د' : 'm'}`;
  if (diffHours < 24) return `${diffHours} ${locale === 'ar' ? 'س' : 'h'}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return locale === 'ar' ? 'أمس' : 'Yesterday';

  if (diffDays < 7) return `${diffDays} ${locale === 'ar' ? 'ي' : 'd'}`;
  if (diffWeeks < 5) return `${diffWeeks} ${locale === 'ar' ? 'أ' : 'w'}`;
  if (diffMonths === 1) return locale === 'ar' ? 'شهر' : '1 month';

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}
