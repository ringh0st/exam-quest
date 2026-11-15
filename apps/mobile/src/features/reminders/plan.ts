import { addDays, daysBetween, fromIsoDate, type IsoDate } from '../exams/dates';
import { upcomingExams, type Exam } from '../exams/model';
import { isWithin, toMinutes, type TimeOfDay } from './time';

export type ReminderKind = 'examMorning' | 'dayBefore' | 'threeDaysBefore' | 'weekBefore';

const kindForDaysBefore: Record<number, ReminderKind> = {
  0: 'examMorning',
  1: 'dayBefore',
  3: 'threeDaysBefore',
  7: 'weekBefore',
};

export interface PlannedReminder {
  date: IsoDate;
  time: TimeOfDay;
  kind: ReminderKind;
  /** Exams this reminder is about, soonest first. Several when exams share a day. */
  examIds: string[];
}

export interface ReminderRules {
  today: IsoDate;
  /** Current local time; reminders earlier today are skipped. */
  now: TimeOfDay;
  studyTime: TimeOfDay;
  examMorningTime: TimeOfDay;
  /** Days before each exam to remind, e.g. [0, 1, 3, 7]. Earlier entries win on busy days. */
  daysBefore: readonly number[];
  quietHours: { start: TimeOfDay; end: TimeOfDay };
  /** Weekday school hours: no reminders then. */
  schoolHours: { start: TimeOfDay; end: TimeOfDay };
  maxPerDay: number;
  horizonDays: number;
}

/** No reminders in quiet hours, or in school hours on weekdays. */
export function isAllowedTime(
  date: IsoDate,
  time: TimeOfDay,
  rules: Pick<ReminderRules, 'quietHours' | 'schoolHours'>,
): boolean {
  if (isWithin(time, rules.quietHours)) return false;
  const weekday = fromIsoDate(date).getDay();
  const isSchoolDay = weekday >= 1 && weekday <= 5;
  return !(isSchoolDay && isWithin(time, rules.schoolHours));
}

/**
 * Plans study reminders for upcoming exams. Pure: the caller schedules them.
 *
 * Product rules: at most `maxPerDay` reminders a day; never in quiet hours or school hours; the
 * reminder closest to an exam wins a busy day; exams on the same day share one reminder.
 */
export function planReminders(exams: readonly Exam[], rules: ReminderRules): PlannedReminder[] {
  const priority = (daysBefore: number) => rules.daysBefore.indexOf(daysBefore);
  const candidates: (PlannedReminder & { rank: number })[] = [];

  for (const exam of upcomingExams(exams, rules.today)) {
    for (const days of rules.daysBefore) {
      const kind = kindForDaysBefore[days];
      if (!kind) continue;
      const date = addDays(exam.date, -days);
      const time = days === 0 ? rules.examMorningTime : rules.studyTime;
      const ahead = daysBetween(rules.today, date);
      if (ahead < 0 || ahead > rules.horizonDays) continue;
      if (ahead === 0 && toMinutes(time) <= toMinutes(rules.now)) continue;
      if (!isAllowedTime(date, time, rules)) continue;
      candidates.push({ date, time, kind, examIds: [exam.id], rank: priority(days) });
    }
  }

  const byDate = new Map<IsoDate, (PlannedReminder & { rank: number })[]>();
  for (const candidate of candidates) {
    byDate.set(candidate.date, [...(byDate.get(candidate.date) ?? []), candidate]);
  }

  const planned: PlannedReminder[] = [];
  for (const [date, dayCandidates] of byDate) {
    // Same kind on the same day (e.g. two exams tomorrow) becomes one reminder.
    const merged = new Map<string, PlannedReminder & { rank: number }>();
    for (const candidate of dayCandidates) {
      const key = `${candidate.kind}@${candidate.time}`;
      const existing = merged.get(key);
      merged.set(
        key,
        existing
          ? { ...existing, examIds: [...existing.examIds, ...candidate.examIds] }
          : candidate,
      );
    }
    const chosen = [...merged.values()]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, rules.maxPerDay)
      .map(({ rank: _rank, ...reminder }) => ({ ...reminder, date }));
    planned.push(...chosen);
  }

  return planned.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}
