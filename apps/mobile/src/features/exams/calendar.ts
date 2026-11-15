import { addDays, fromIsoDate, toIsoDate, type IsoDate } from './dates';

export interface YearMonth {
  year: number;
  /** 1–12 */
  month: number;
}

export function monthOf(date: IsoDate): YearMonth {
  const d = fromIsoDate(date);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** First day of the month as an ISO date. */
export function firstOfMonth({ year, month }: YearMonth): IsoDate {
  return toIsoDate(new Date(year, month - 1, 1));
}

/**
 * Weeks of a month for a calendar grid: 7 cells per row, `null` outside the month.
 * `weekStartsOn` is 0 for Sunday, 1 for Monday (Finland).
 */
export function monthGrid(month: YearMonth, weekStartsOn: 0 | 1): (IsoDate | null)[][] {
  const first = firstOfMonth(month);
  const lead = (fromIsoDate(first).getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(month.year, month.month, 0).getDate();
  const cells: (IsoDate | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (IsoDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Weekday indexes (0 = Sunday) in display order. */
export function weekdayOrder(weekStartsOn: 0 | 1): number[] {
  return Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7);
}
