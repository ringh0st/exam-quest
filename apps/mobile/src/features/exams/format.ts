import { fromIsoDate, type IsoDate } from './dates';

/** "Fri, Nov 20" in the student's language. */
export function formatExamDate(date: IsoDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(fromIsoDate(date));
}

/** "Friday, November 20, 2026", for detail views and screen-reader labels. */
export function formatExamDateLong(date: IsoDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(fromIsoDate(date));
}

/** "November 2026" */
export function formatMonth(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
}

/** Short weekday names, indexed by `Date.getDay()` (0 = Sunday). */
export function weekdayNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2026-11-15 is a Sunday.
  return Array.from({ length: 7 }, (_, i) => format.format(new Date(2026, 10, 15 + i)));
}
