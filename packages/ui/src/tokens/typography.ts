/**
 * Type tokens. Text scales with the system font size (up to 200% and beyond), so text components
 * must not cap font scaling and must scale line heights too (see `components/Text`).
 *
 * Custom fonts select their weight by font file, not `fontWeight` (Android ignores `fontWeight`
 * for custom families), so each weight maps to its own face. The app loads these faces with
 * expo-font; the names must match the loaded font keys.
 */
export const fontFaces = {
  /** Gamified look (light and dark themes). */
  brand: {
    regular: 'Rubik_400Regular',
    medium: 'Rubik_500Medium',
    bold: 'Rubik_700Bold',
    heavy: 'Rubik_800ExtraBold',
  },
  /** Calm mode. */
  calm: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    bold: 'Inter_700Bold',
    heavy: 'Inter_800ExtraBold',
  },
} as const;

export type FontFamilyName = keyof typeof fontFaces;
export type FontWeightName = keyof (typeof fontFaces)['brand'];
export type FontFaceSet = Record<FontWeightName, string>;

export const textStyle = {
  display: { fontSize: 34, lineHeight: 40, weight: 'heavy' },
  title: { fontSize: 28, lineHeight: 34, weight: 'heavy' },
  heading: { fontSize: 20, lineHeight: 26, weight: 'bold' },
  body: { fontSize: 16, lineHeight: 24, weight: 'regular' },
  bodyStrong: { fontSize: 16, lineHeight: 24, weight: 'bold' },
  label: { fontSize: 14, lineHeight: 20, weight: 'bold' },
  caption: { fontSize: 13, lineHeight: 18, weight: 'regular' },
  overline: { fontSize: 12, lineHeight: 16, weight: 'bold', letterSpacing: 1 },
} as const satisfies Record<
  string,
  { fontSize: number; lineHeight: number; weight: FontWeightName; letterSpacing?: number }
>;

export type TextVariant = keyof typeof textStyle;
