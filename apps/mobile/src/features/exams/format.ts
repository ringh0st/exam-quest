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
