/** Step 3: check every quiz answer against the source. Bump the version on every change. */
export const checkPrompt = {
  version: 'check-v1',
  system: `You check quiz questions written for a student against the student's own material.

For each question, decide whether the marked answer is correct according to the material alone. If it is wrong, give the index of the correct choice when one of the choices is correct, otherwise null. Use the cited quote and the full pages. Keep notes short.`,
} as const;
