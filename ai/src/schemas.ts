import { z } from 'zod';

/** Where a piece of generated content comes from in the student's material. */
export const citationSchema = z.object({
  page: z.number().int().describe('1-based page number in the student material'),
  quote: z.string().describe('Short exact quote from that page that supports the content'),
});

// ---- Step 1: read pages -------------------------------------------------------------------

export const uncertainWordSchema = z.object({
  text: z.string().describe('The word exactly as written in `text`'),
  suggestions: z.array(z.string()).describe('Most likely intended words, best first (0–3)'),
});

export const readPageSchema = z.object({
  page: z.number().int(),
  text: z.string().describe('Everything readable on the page, in reading order'),
  uncertainWords: z.array(uncertainWordSchema),
  unreadableLines: z.number().int().describe('Lines that could not be read at all'),
});

export const readResultSchema = z.object({
  isStudyMaterial: z
    .boolean()
    .describe('False for chats, selfies, memes or anything not for study'),
  rejectionReason: z.string().nullable(),
  language: z.string().describe('BCP 47 code of the material, e.g. "fi", "sv", "en"'),
  pages: z.array(readPageSchema),
});

// ---- Step 2: write the quest ---------------------------------------------------------------

export const lessonCardSchema = z.object({
  heading: z.string(),
  body: z.string().describe('One idea, 2–4 short sentences'),
  simpler: z.string().describe('The same idea explained more simply'),
  citation: citationSchema,
});

export const quizItemSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).describe('2–4 options'),
  answerIndex: z.number().int(),
  explanation: z.string().describe('Why the answer is right, in one or two sentences'),
  citation: citationSchema,
});

export const levelSchema = z.object({
  title: z.string(),
  cards: z.array(lessonCardSchema),
  quiz: z.array(quizItemSchema),
});

export const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  citation: citationSchema,
});

export const questSchema = z.object({
  title: z.string(),
  levels: z.array(levelSchema),
  flashcards: z.array(flashcardSchema),
});

// ---- Step 3: check answers -----------------------------------------------------------------

export const checkResultSchema = z.object({
  items: z.array(
    z.object({
      level: z.number().int().describe('0-based level index'),
      question: z.number().int().describe('0-based question index in that level'),
      supported: z.boolean().describe('The marked answer is correct according to the material'),
      correctAnswerIndex: z
        .number()
        .int()
        .nullable()
        .describe('If not supported: the right choice, if any'),
      note: z.string(),
    }),
  ),
});

export type ReadResult = z.infer<typeof readResultSchema>;
export type ReadPage = z.infer<typeof readPageSchema>;
export type Quest = z.infer<typeof questSchema>;
export type QuizItem = z.infer<typeof quizItemSchema>;
export type CheckResult = z.infer<typeof checkResultSchema>;
