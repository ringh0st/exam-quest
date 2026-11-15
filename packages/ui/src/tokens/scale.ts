/** Spacing scale on a 4 pt grid. Use `space[4]` (16) rather than raw numbers. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  regular: 2,
  strong: 2.5,
} as const;

export const size = {
  /** Minimum touch target: 44 pt on iOS, 48 dp on Android. We use 48 on both. */
  minTouchTarget: 48,
  icon: { sm: 16, md: 24, lg: 32 },
  /** Height of the raised "3D" edge under game-style buttons and cards. */
  raisedEdge: 5,
} as const;

export type Space = keyof typeof space;
export type Radius = keyof typeof radius;
