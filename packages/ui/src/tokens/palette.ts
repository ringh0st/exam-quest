/**
 * Raw colour palette. Components never use these directly: they use the semantic colours of the
 * active theme (see `theme/themes.ts`), which pick from this palette.
 *
 * Accessibility notes (WCAG 2.2 AA, checked in `theme/__tests__/themes.test.ts`):
 * - `coral.400` is too light for white text (2.8:1). Use `coral.600` behind text; 400 is decorative.
 * - `violet.300` and `neutral.400` are too light for text on white; use them for disabled states
 *   and decoration only.
 */
export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  violet: {
    50: '#F7F5FF',
    100: '#EDE6FF',
    200: '#E4DEFA',
    300: '#C9BCFF',
    400: '#9C80FF',
    500: '#5B2EFF',
    600: '#4520D6',
    700: '#3D2F7A',
    800: '#2D2160',
    900: '#1D1442',
    950: '#120C2E',
  },
  coral: {
    100: '#FBE4DE',
    300: '#FF8A73',
    400: '#FF6B4A',
    500: '#D94A2B',
    600: '#C93B18',
    700: '#A3361F',
    900: '#3A1D18',
  },
  mint: {
    100: '#DDF8EC',
    400: '#3DDC97',
    500: '#25B077',
    600: '#1F7A51',
    800: '#16352A',
    900: '#0E3B28',
  },
  amber: {
    100: '#FFF0D6',
    400: '#FFB443',
    500: '#D9901F',
    700: '#6B4600',
    800: '#3A2A10',
    900: '#4A2C00',
  },
  neutral: {
    // Cool greys with a slight violet bias, matching the brand.
    100: '#F0EEF6',
    300: '#D2CAF0',
    400: '#8C84AD',
    500: '#6F64A0',
    600: '#5A5278',
    700: '#3A2F6B',
  },
  calm: {
    // Calm mode: quieter ink-and-paper colours from the "Margin Notes" direction.
    paper: '#F5F7FB',
    surface: '#FFFFFF',
    sunken: '#EEF2FB',
    line: '#DDE3EE',
    ink: '#14213D',
    muted: '#4D5A78',
    disabled: '#9AA6BF',
    blue: '#2B4ACB',
    highlight: '#FFE45C',
  },
} as const;

export type Palette = typeof palette;
