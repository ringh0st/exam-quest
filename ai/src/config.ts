/**
 * Model choice per step. Defaults to Claude Opus 5.5 everywhere; switching a step to a cheaper
 * model is a product decision to make with eval results (see eval/), not a guess.
 */
export const pipelineConfig = {
  read: { model: 'claude-opus-5-5', effort: 'high', maxTokens: 16000 },
  write: { model: 'claude-opus-5-5', effort: 'high', maxTokens: 32000 },
  check: { model: 'claude-opus-5-5', effort: 'medium', maxTokens: 8000 },
} as const;

export type PipelineStep = keyof typeof pipelineConfig;

/** USD per million tokens (first-party API rates, cached 2026-11). Used for cost-per-student. */
export const pricing: Record<string, { input: number; output: number; cacheRead: number }> = {
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.1 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheRead: 0.01 },
};

/** Cache writes cost 1.25× the input price. */
export const cacheWriteMultiplier = 1.25;
