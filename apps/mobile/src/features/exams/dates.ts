/**
 * Calendar dates as `YYYY-MM-DD` strings in the student's local time zone. Exams happen on a day,
 * not at an instant, so we never store them as timestamps (no time-zone or DST surprises).
 */
export type IsoDate = string;

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): value is IsoDate {
  const match = isoDatePattern.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** The local calendar date of a moment. */
export function toIsoDate(moment: Date): IsoDate {
  const y = moment.getFullYear();
  const m = String(moment.getMonth() + 1).padStart(2, '0');
  const d = String(moment.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Local midnight of an ISO date. */
export function fromIsoDate(date: IsoDate): Date {
  const match = isoDatePattern.exec(date);
  if (!match || !isIsoDate(date)) {
    throw new Error(`Invalid date "${date}"`);
  }
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  return new Date(y, m - 1, d);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const result = fromIsoDate(date);
  result.setDate(result.getDate() + days);
  return toIsoDate(result);
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). DST-safe. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const a = fromIsoDate(from);
  const b = fromIsoDate(to);
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
}

export function today(now: Date = new Date()): IsoDate {
  return toIsoDate(now);
}
