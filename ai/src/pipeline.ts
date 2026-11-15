import type Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { z } from 'zod';

import { pipelineConfig, type PipelineStep } from './config.ts';
import { costMicros, type TokenUsage } from './cost.ts';
import { checkPrompt } from './prompts/check.ts';
import { readPrompt } from './prompts/read.ts';
import { writePrompt } from './prompts/write.ts';
import {
  checkResultSchema,
  questSchema,
  readResultSchema,
  type CheckResult,
  type Quest,
  type ReadPage,
  type ReadResult,
} from './schemas.ts';

export interface StepUsage {
  step: PipelineStep;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
}

export interface StepResult<T> {
  output: T;
  usage: StepUsage;
}

export class PipelineError extends Error {
  readonly reason: 'refusal' | 'max_tokens' | 'invalid_output';
  readonly step: PipelineStep;

  constructor(message: string, reason: PipelineError['reason'], step: PipelineStep) {
    super(message);
    this.name = 'PipelineError';
    this.reason = reason;
    this.step = step;
  }
}

export interface PageImage {
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Base64 without a data: prefix. Resize on the phone first (long edge ≤ 2576 px). */
  data: string;
}

type Content = Anthropic.Beta.BetaContentBlockParam[];

/** One structured-output request with validation, refusal fallback and usage accounting. */
async function runStep<Schema extends z.ZodType>(
  client: Anthropic,
  step: PipelineStep,
  prompt: { version: string; system: string },
  content: Content,
  schema: Schema,
): Promise<StepResult<z.infer<Schema>>> {
  const config = pipelineConfig[step];
  const response = await client.beta.messages.parse({
    model: config.model,
    max_tokens: config.maxTokens,
    // A declined request is retried on a fallback model chosen by refusal category.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    // The system prompt is identical for every student, so cache it.
    system: [{ type: 'text', text: prompt.system, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: config.effort, format: betaZodOutputFormat(schema) },
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') {
    throw new PipelineError('The model declined this material', 'refusal', step);
  }
  if (response.stop_reason === 'max_tokens') {
    throw new PipelineError('The output was cut off', 'max_tokens', step);
  }
  const parsed = schema.safeParse(response.parsed_output);
  if (!parsed.success) {
    throw new PipelineError(
      `Output did not match the schema: ${parsed.error.message}`,
      'invalid_output',
      step,
    );
  }

  const usage = response.usage as TokenUsage;
  return {
    output: parsed.data,
    usage: {
      step,
      // The model that actually answered (differs from the request if a fallback ran).
      model: response.model,
      promptVersion: prompt.version,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      costMicros: costMicros(response.model, usage),
    },
  };
}

/** Step 1: read photos into text, flagging uncertain words. */
export function readPages(client: Anthropic, images: readonly PageImage[]) {
  if (images.length === 0) throw new Error('No pages to read');
  const content: Content = images.flatMap((image, index) => [
    { type: 'text' as const, text: `Page ${index + 1}:` },
    {
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: image.mediaType, data: image.data },
    },
  ]);
  content.push({ type: 'text', text: `Read these ${images.length} page(s).` });
  return runStep(client, 'read', readPrompt, content, readResultSchema);
}

function pagesAsText(pages: readonly Pick<ReadPage, 'page' | 'text'>[]): string {
  return pages.map((page) => `<page number="${page.page}">\n${page.text}\n</page>`).join('\n\n');
}

export interface WriteOptions {
  /** Language to teach in: "source" keeps the material's language. */
  lessonLanguage: string;
  /** e.g. "upper secondary school (lukio), Finland" */
  level: string;
  examTopic?: string;
}

/** Step 2: write levels, quiz questions and flashcards from the (checked) page text. */
export function writeQuest(
  client: Anthropic,
  pages: readonly Pick<ReadPage, 'page' | 'text'>[],
  options: WriteOptions,
) {
  const language =
    options.lessonLanguage === 'source'
      ? 'the same language as the material'
      : options.lessonLanguage;
  const text = [
    `Student: ${options.level}.`,
    options.examTopic ? `Exam topic: ${options.examTopic}.` : null,
    `Write the quest in ${language}.`,
    '',
    pagesAsText(pages),
  ]
    .filter((line) => line !== null)
    .join('\n');
  return runStep(client, 'write', writePrompt, [{ type: 'text', text }], questSchema);
}

/** Step 3: check every quiz answer against the pages. */
export function checkQuest(
  client: Anthropic,
  pages: readonly Pick<ReadPage, 'page' | 'text'>[],
  quest: Quest,
) {
  const questions = quest.levels.flatMap((level, levelIndex) =>
    level.quiz.map((item, questionIndex) => ({
      level: levelIndex,
      question: questionIndex,
      text: item.question,
      choices: item.choices,
      markedAnswerIndex: item.answerIndex,
      citation: item.citation,
    })),
  );
  const text = `${pagesAsText(pages)}\n\nQuestions to check:\n${JSON.stringify(questions, null, 2)}`;
  return runStep(client, 'check', checkPrompt, [{ type: 'text', text }], checkResultSchema);
}

export interface VerifiedQuest extends Quest {
  /** Questions removed because the material didn't support any choice. */
  removedQuestions: number;
  /** Questions whose marked answer was corrected. */
  correctedQuestions: number;
}

/**
 * Applies the check: corrects answers the checker could fix, removes questions it couldn't.
 * Only checked questions are kept, so nothing unverified reaches a student.
 */
export function applyCheck(quest: Quest, check: CheckResult): VerifiedQuest {
  const verdicts = new Map(check.items.map((item) => [`${item.level}:${item.question}`, item]));
  let removedQuestions = 0;
  let correctedQuestions = 0;

  const levels = quest.levels.map((level, levelIndex) => ({
    ...level,
    quiz: level.quiz.flatMap((item, questionIndex) => {
      const verdict = verdicts.get(`${levelIndex}:${questionIndex}`);
      if (verdict?.supported) return [item];
      const fix = verdict?.correctAnswerIndex;
      if (fix !== null && fix !== undefined && fix >= 0 && fix < item.choices.length) {
        correctedQuestions += 1;
        return [{ ...item, answerIndex: fix }];
      }
      removedQuestions += 1;
      return [];
    }),
  }));

  return { ...quest, levels, removedQuestions, correctedQuestions };
}

export interface QuestResult {
  read?: ReadResult;
  quest: VerifiedQuest;
  usage: StepUsage[];
}

/** The full pipeline after the student has checked the text: write, then check. */
export async function buildQuest(
  client: Anthropic,
  pages: readonly Pick<ReadPage, 'page' | 'text'>[],
  options: WriteOptions,
): Promise<QuestResult> {
  const written = await writeQuest(client, pages, options);
  const checked = await checkQuest(client, pages, written.output);
  return {
    quest: applyCheck(written.output, checked.output),
    usage: [written.usage, checked.usage],
  };
}
