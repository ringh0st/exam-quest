import { cacheWriteMultiplier, pricing } from './config.ts';

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

/** Cost of one request in millionths of a US dollar (stored as an integer in ai_usage). */
export function costMicros(model: string, usage: TokenUsage): number {
  const price = pricing[model];
  if (!price) throw new Error(`No price for model "${model}"`);
  const dollars =
    (usage.input_tokens * price.input +
      usage.output_tokens * price.output +
      (usage.cache_read_input_tokens ?? 0) * price.cacheRead +
      (usage.cache_creation_input_tokens ?? 0) * price.input * cacheWriteMultiplier) /
    1_000_000;
  return Math.round(dollars * 1_000_000);
}
