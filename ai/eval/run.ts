/**
 * Reading evaluation: how well does the read step transcribe real pages, and what does it cost?
 *
 *   npm run eval -w @exam-quest/ai            # all cases in eval/cases/
 *
 * Each case is a folder in eval/cases/ with page photos (page-1.jpg, page-2.jpg, …) and
 * expected.txt, the correct transcription. Cases contain student material and are not committed.
 * Needs Claude API credentials (ANTHROPIC_API_KEY or an `ant auth login` profile). Every run
 * calls the API and costs money.
 */
import Anthropic from '@anthropic-ai/sdk';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { wordAccuracy } from '../src/accuracy.ts';
import { pipelineConfig } from '../src/config.ts';
import { readPages, type PageImage } from '../src/pipeline.ts';
import { readPrompt } from '../src/prompts/read.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const casesDir = join(here, 'cases');
const mediaTypes: Record<string, PageImage['mediaType']> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

interface CaseResult {
  case: string;
  pages: number;
  accuracy: number;
  uncertainWords: number;
  costMicros: number;
  error?: string;
}

const cases = readdirSync(casesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (cases.length === 0) {
  console.error(`No cases in ${casesDir}. Add folders with page photos and expected.txt.`);
  process.exit(1);
}

const client = new Anthropic();
const results: CaseResult[] = [];

for (const name of cases) {
  const dir = join(casesDir, name);
  const photos = readdirSync(dir)
    .filter((file) => file.startsWith('page-') && mediaTypes[extname(file).toLowerCase()])
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const images: PageImage[] = photos.map((file) => ({
    mediaType: mediaTypes[extname(file).toLowerCase()] ?? 'image/jpeg',
    data: readFileSync(join(dir, file)).toString('base64'),
  }));
  const expected = readFileSync(join(dir, 'expected.txt'), 'utf8');

  let result: CaseResult;
  try {
    const { output, usage } = await readPages(client, images);
    const transcribed = output.pages.map((page) => page.text).join('\n');
    result = {
      case: name,
      pages: images.length,
      accuracy: wordAccuracy(transcribed, expected),
      uncertainWords: output.pages.reduce((sum, page) => sum + page.uncertainWords.length, 0),
      costMicros: usage.costMicros,
    };
  } catch (error) {
    result = {
      case: name,
      pages: images.length,
      accuracy: 0,
      uncertainWords: 0,
      costMicros: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
  results.push(result);
  console.log(
    result.error
      ? `${name}: ERROR ${result.error}`
      : `${name}: ${(result.accuracy * 100).toFixed(1)}% words, $${(result.costMicros / 1e6).toFixed(4)}`,
  );
}

const ok = results.filter((result) => !result.error);
const totalPages = ok.reduce((sum, result) => sum + result.pages, 0);
const summary = {
  ranAt: new Date().toISOString(),
  model: pipelineConfig.read.model,
  effort: pipelineConfig.read.effort,
  promptVersion: readPrompt.version,
  cases: results.length,
  failed: results.length - ok.length,
  meanAccuracy: ok.length ? ok.reduce((sum, result) => sum + result.accuracy, 0) / ok.length : 0,
  costPerPageUsd: totalPages
    ? ok.reduce((sum, result) => sum + result.costMicros, 0) / totalPages / 1e6
    : 0,
  results,
};

mkdirSync(join(here, 'reports'), { recursive: true });
const reportPath = join(here, 'reports', `read-${summary.ranAt.replace(/[:.]/g, '-')}.json`);
writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(
  `\nMean word accuracy ${(summary.meanAccuracy * 100).toFixed(1)}% over ${ok.length} case(s), ` +
    `$${summary.costPerPageUsd.toFixed(4)} per page. Report: ${reportPath}`,
);
