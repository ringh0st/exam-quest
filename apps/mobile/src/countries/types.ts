import { z } from 'zod';

import { subjectIds } from '../features/exams/subjects';

const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24 h)');

export const helpResourceSchema = z.object({
  id: z.string(),
  /** Shown as-is; names of services are not translated. */
  name: z.string(),
  kind: z.enum(['emergency', 'phone', 'chat', 'school']),
  phone: z.string().optional(),
  url: z.url().optional(),
});

export const countryPackSchema = z.object({
  code: z.string().length(2),
  /** Minimum age to use the app without a guardian (GDPR digital consent age, rounded up to 13). */
  minimumAge: z.number().int().min(13),
  /** Age below which purchases need a guardian's approval. */
  guardianApprovalForPurchasesUnder: z.number().int(),
  schoolTypes: z.array(z.enum(['lowerSecondary', 'upperSecondary', 'vocational'])).nonempty(),
  /** Subjects offered when adding an exam, in display order. */
  subjects: z.array(z.enum(subjectIds)).nonempty(),
  grades: z.object({
    /** Numeric course grades. */
    course: z.object({ min: z.number(), max: z.number(), pass: z.number() }),
    /** Final national exam grades, best first (if the country has one). */
    finalExam: z.array(z.string()).optional(),
  }),
  /** No reminders during school hours (local time, weekdays). */
  schoolHours: z.object({ start: timeOfDay, end: timeOfDay }),
  /** First day of the week in calendars: 0 Sunday, 1 Monday. */
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  /** Whether schools end study periods with exam weeks. */
  hasExamWeeks: z.boolean(),
  helpResources: z.array(helpResourceSchema).nonempty(),
});

export type CountryPack = z.infer<typeof countryPackSchema>;
export type HelpResource = z.infer<typeof helpResourceSchema>;
