import { z } from 'zod';

import { addDays, daysBetween, isIsoDate, type IsoDate } from './dates';
import { subjectIds } from './subjects';

export const examSubjectSchema = z.union([
  z.object({ kind: z.literal('known'), id: z.enum(subjectIds) }),
  z.object({ kind: z.literal('custom'), name: z.string().trim().min(1).max(60) }),
]);

export const examSchema = z.object({
  id: z.string().min(1),
  subject: examSubjectSchema,
  /** Optional topic or chapter, e.g. "Chemical bonds, chapter 5". */
  topic: z.string().trim().max(120).optional(),
  date: z.string().refine(isIsoDate, 'Expected a YYYY-MM-DD date'),
  createdAt: z.string(),
});

export type Exam = z.infer<typeof examSchema>;
export type ExamSubject = z.infer<typeof examSubjectSchema>;

export const newExamSchema = examSchema.omit({ id: true, createdAt: true });
export type NewExam = z.infer<typeof newExamSchema>;

/** Days left until the exam: 0 on exam day, negative afterwards. */
export function daysUntil(exam: Pick<Exam, 'date'>, todayDate: IsoDate): number {
  return daysBetween(todayDate, exam.date);
}

/** Exams from today onwards, soonest first; ties keep the order they were added. */
export function upcomingExams(exams: readonly Exam[], todayDate: IsoDate): Exam[] {
  return exams
    .filter((exam) => daysUntil(exam, todayDate) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
}

/** Exams before today, most recent first. */
export function pastExams(exams: readonly Exam[], todayDate: IsoDate): Exam[] {
  return exams
    .filter((exam) => daysUntil(exam, todayDate) < 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Quick date choices for the add-exam flow. */
export function dateShortcuts(todayDate: IsoDate): { tomorrow: IsoDate; nextWeek: IsoDate } {
  return { tomorrow: addDays(todayDate, 1), nextWeek: addDays(todayDate, 7) };
}
