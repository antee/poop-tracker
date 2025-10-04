import type { WeekRange } from '../types';

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((p) => parseInt(p, 10));
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

export function getWeekRangeForDate(date: Date): WeekRange {
  const start = startOfWeekMonday(date);
  const end = addDays(start, 6);
  return { startIso: toIsoDate(start), endIso: toIsoDate(end) };
}

export function listDaysInRange(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  let d = fromIsoDate(startIso);
  const end = fromIsoDate(endIso);
  while (d <= end) {
    days.push(toIsoDate(d));
    d = addDays(d, 1);
  }
  return days;
}

export function formatIso(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = fromIsoDate(iso);
  return new Intl.DateTimeFormat('sv-SE', opts).format(d);
}

export function formatWeekRange(range: WeekRange): string {
  const start = formatIso(range.startIso, { day: '2-digit', month: '2-digit' });
  const end = formatIso(range.endIso, { day: '2-digit', month: '2-digit' });
  return `${start} – ${end}`;
}

