/**
 * Time/date formatters — Vietnamese locale.
 */
const VI_LOCALE = 'vi-VN';

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(VI_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  const diffMs = now.getTime() - t;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD} ngày trước`;
  return formatDate(iso);
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(VI_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat(VI_LOCALE).format(amount) + 'đ';
}

// ageFromBirthday is implemented in bmi.ts. Re-exported via utils/index.ts.

export function formatStreak(days: number): string {
  if (days === 0) return 'Chưa có streak';
  if (days === 1) return '1 ngày';
  return `${days} ngày`;
}
