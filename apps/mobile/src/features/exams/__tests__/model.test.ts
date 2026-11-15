import {
  dateShortcuts,
  daysUntil,
  examSchema,
  pastExams,
  upcomingExams,
  type Exam,
} from '../model';

const exam = (id: string, date: string, createdAt = '2026-11-01T10:00:00Z'): Exam => ({
  id,
  subject: { kind: 'known', id: 'biology' },
  date,
  createdAt,
});

describe('exam model', () => {
  it('counts days until the exam', () => {
    expect(daysUntil(exam('a', '2026-11-20'), '2026-11-15')).toBe(5);
    expect(daysUntil(exam('a', '2026-11-15'), '2026-11-15')).toBe(0);
    expect(daysUntil(exam('a', '2026-11-14'), '2026-11-15')).toBe(-1);
  });

  it('lists upcoming exams soonest first, including today', () => {
    const exams = [
      exam('later', '2026-12-03'),
      exam('past', '2026-11-10'),
      exam('today', '2026-11-15'),
      exam('soon', '2026-11-20'),
    ];
    expect(upcomingExams(exams, '2026-11-15').map((e) => e.id)).toEqual(['today', 'soon', 'later']);
    expect(pastExams(exams, '2026-11-15').map((e) => e.id)).toEqual(['past']);
  });

  it('keeps insertion order for exams on the same day', () => {
    const exams = [
      exam('second', '2026-11-20', '2026-11-02T00:00:00Z'),
      exam('first', '2026-11-20', '2026-11-01T00:00:00Z'),
    ];
    expect(upcomingExams(exams, '2026-11-15').map((e) => e.id)).toEqual(['first', 'second']);
  });

  it('offers tomorrow and next week as shortcuts', () => {
    expect(dateShortcuts('2026-11-15')).toEqual({ tomorrow: '2026-11-16', nextWeek: '2026-11-22' });
  });

  it('validates exams', () => {
    expect(examSchema.safeParse(exam('a', '2026-11-20')).success).toBe(true);
    expect(examSchema.safeParse(exam('a', '2026-02-30')).success).toBe(false);
    expect(
      examSchema.safeParse({ ...exam('a', '2026-11-20'), subject: { kind: 'custom', name: ' ' } })
        .success,
    ).toBe(false);
  });
});
