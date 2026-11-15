/** Splits text into comparable words: lower-case, punctuation removed, Unicode letters kept. */
export function words(text: string): string[] {
  return text
    .normalize('NFC')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * Word accuracy of a transcription against the correct text: 1 − (word edit distance ÷ number
 * of correct words). 1 is perfect; it can go below 0 when the transcription adds many words.
 */
export function wordAccuracy(transcribed: string, expected: string): number {
  const a = words(transcribed);
  const b = words(expected);
  if (b.length === 0) return a.length === 0 ? 1 : 0;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, substitution);
    }
    previous = current;
  }
  return 1 - (previous[b.length] ?? 0) / b.length;
}
