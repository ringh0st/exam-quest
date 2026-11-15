/** Semantic colours. Components use only these, so every theme works with every component. */
export interface ThemeColors {
  /** Screen background. */
  background: string;
  /** Cards, sheets, list groups. */
  surface: string;
  /** Inset areas: segmented controls, chips, tracks. */
  surfaceSunken: string;
  /** Hairlines and outlines of cards and inputs (decorative, not a text colour). */
  border: string;
  text: string;
  textMuted: string;
  /** Disabled text only. Exempt from contrast rules; never use for content. */
  textDisabled: string;
  primary: string;
  onPrimary: string;
  /** The raised edge under primary buttons (decorative). */
  primaryEdge: string;
  accent: string;
  onAccent: string;
  accentEdge: string;
  success: string;
  onSuccess: string;
  successSurface: string;
  onSuccessSurface: string;
  warning: string;
  onWarning: string;
  warningSurface: string;
  onWarningSurface: string;
  dangerSurface: string;
  onDangerSurface: string;
  /** Keyboard / switch-control focus indicator. Must reach 3:1 against background and surface. */
  focusRing: string;
  /** Dimmed backdrop behind sheets and dialogs. */
  scrim: string;
}

export type ThemeName = 'light' | 'dark' | 'calm';

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  /** Whether game elements (XP, streaks, chests, raised edges, celebrations) are shown. */
  playful: boolean;
  /** Status bar / native control appearance. */
  scheme: 'light' | 'dark';
}
