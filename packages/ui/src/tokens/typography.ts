/**
 * Type scale. Sizes are in points and scale with the system font size (up to 200%), so text
 * components must not cap font scaling, and line heights must scale with it too.
 */
export const fontFamily = {
  /** Gamified look. Loaded with expo-font in the app; falls back to the system font until then. */
  brand: 'Rubik',
  /** Calm mode. */
  calm: 'Inter',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
  heavy: '800',
} as const;

export const textStyle = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: fontWeight.heavy },
  title: { fontSize: 28, lineHeight: 34, fontWeight: fontWeight.heavy },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: fontWeight.bold },
  body: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.bold },
  label: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.bold },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: fontWeight.regular },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.bold, letterSpacing: 1 },
} as const;

export type TextVariant = keyof typeof textStyle;
