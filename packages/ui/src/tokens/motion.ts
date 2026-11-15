/** Animation durations in milliseconds. When the system asks for reduced motion, use `none`. */
export const duration = {
  none: 0,
  fast: 120,
  normal: 220,
  slow: 400,
  celebrate: 900,
} as const;

export type Duration = keyof typeof duration;
