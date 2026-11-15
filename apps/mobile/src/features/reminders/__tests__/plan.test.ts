import type { Exam } from '../../exams/model';
import { isAllowedTime, planReminders, type ReminderRules } from '../plan';
import { isWithin } from '../time';

const rules: ReminderRules = {
  today: '2026-11-15', // a Sunday
  now: '12:00',
  studyTime: '17:00',
  examMorningTime: '07:30',
  daysBefore: [0, 1, 3, 7],
  quietHours: { start: '22:00', end: '07:00' },
  schoolHours: { start: '08:00', end: '15:00' },
  maxPerDay: 1,
  horizonDays: 30,
};

const exam = (id: string, date: string): Exam => ({
  id,
  subject: { kind: 'known', id: 'biology' },
  date,
  createdAt: `2026-11-01T00:00:0${id.length}Z`,
});

describe('time ranges', () => {
  it('handles ranges that wrap past midnight', () => {
    expect(isWithin('23:30', rules.quietHours)).toBe(true);
    expect(isWithin('06:59', rules.quietHours)).toBe(true);
    expect(isWithin('07:00', rules.quietHours)).toBe(false);
    expect(isWithin('09:00', rules.schoolHours)).toBe(true);
  });

  it('allows school-hour times on weekends only', () => {
    expect(isAllowedTime('2026-11-16', '10:00', rules)).toBe(false); // Monday
    expect(isAllowedTime('2026-11-21', '10:00', rules)).toBe(true); // Saturday
    expect(isAllowedTime('2026-11-21', '23:00', rules)).toBe(false); // quiet hours
  });
});

describe('planReminders', () => {
  it('reminds a week, three days and a day before, and on the exam morning', () => {
    const plan = planReminders([exam('bio', '2026-11-27')], rules);
    expect(plan).toEqual([
      { date: '2026-11-20', time: '17:00', kind: 'weekBefore', examIds: ['bio'] },
      { date: '2026-11-24', time: '17:00', kind: 'threeDaysBefore', examIds: ['bio'] },
      { date: '2026-11-26', time: '17:00', kind: 'dayBefore', examIds: ['bio'] },
      { date: '2026-11-27', time: '07:30', kind: 'examMorning', examIds: ['bio'] },
    ]);
  });

  it('never sends more than one reminder a day; the closest exam wins', () => {
    // Exam A on the 19th (its day-before is the 18th); exam B on the 21st (its 3-days is the 18th).
    const plan = planReminders([exam('a', '2026-11-19'), exam('bb', '2026-11-21')], rules);
    const onThe18th = plan.filter((r) => r.date === '2026-11-18');
    expect(onThe18th).toEqual([
      { date: '2026-11-18', time: '17:00', kind: 'dayBefore', examIds: ['a'] },
    ]);
    const counts = new Map<string, number>();
    plan.forEach((r) => counts.set(r.date, (counts.get(r.date) ?? 0) + 1));
    expect(Math.max(...counts.values())).toBe(1);
  });

  it('merges exams on the same day into one reminder', () => {
    const plan = planReminders([exam('a', '2026-11-20'), exam('bb', '2026-11-20')], rules);
    expect(plan.find((r) => r.kind === 'dayBefore')).toEqual({
      date: '2026-11-19',
      time: '17:00',
      kind: 'dayBefore',
      examIds: ['a', 'bb'],
    });
  });

  it('skips times that have passed today and past exams', () => {
    const plan = planReminders([exam('soon', '2026-11-16'), exam('old', '2026-11-10')], {
      ...rules,
      now: '18:00',
    });
    expect(plan).toEqual([
      { date: '2026-11-16', time: '07:30', kind: 'examMorning', examIds: ['soon'] },
    ]);
  });

  it('drops reminders that would fall in school hours or quiet hours', () => {
    const plan = planReminders([exam('bio', '2026-11-27')], { ...rules, studyTime: '10:00' });
    // 10:00 on weekdays is school time; only the exam-morning reminder remains.
    expect(plan.map((r) => r.kind)).toEqual(['examMorning']);
  });

  it('only plans within the horizon', () => {
    expect(planReminders([exam('far', '2027-03-15')], rules)).toEqual([]);
  });
});
