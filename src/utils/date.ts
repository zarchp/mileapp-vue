import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export { dayjs };

export const MS_DAY = 86_400_000;

export function fmtExact(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dayjs(dateStr).format('dddd, DD MMMM YYYY');
}

export function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  const d0 = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  ).getTime();
  const n0 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  return Math.round((d0 - n0) / MS_DAY);
}

export function humanDue(dateStr: string): string {
  const diff = daysUntil(dateStr);
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday (overdue)';
  const due = dayjs(dateStr).startOf('day');
  const now = dayjs().startOf('day');
  return now.to(due);
}

export function humanCompleted(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dayjs(dateStr).fromNow();
}

export function dueBgClass(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d > 7) return 'bg-blue-50/40';
  if (d > 3) return 'bg-sky-50/40';
  if (d >= 1) return 'bg-amber-50/40';
  if (d === 0) return 'bg-orange-50/40';
  return 'bg-red-50/40';
}
