import { contrastRatio, minContrast } from '../contrast';
import { themes } from '../themes';
import type { ThemeColors } from '../types';

type Pair = [foreground: keyof ThemeColors, background: keyof ThemeColors];

/** Every foreground/background pair that components put text on. */
const textPairs: Pair[] = [
  ['text', 'background'],
  ['text', 'surface'],
  ['text', 'surfaceSunken'],
  ['textMuted', 'background'],
  ['textMuted', 'surface'],
  ['textMuted', 'surfaceSunken'],
  ['primary', 'background'],
  ['primary', 'surface'],
  ['onPrimary', 'primary'],
  ['onAccent', 'accent'],
  ['onSuccess', 'success'],
  ['onWarning', 'warning'],
  ['onSuccessSurface', 'successSurface'],
  ['onWarningSurface', 'warningSurface'],
  ['onDangerSurface', 'dangerSurface'],
];

/** Meaningful non-text UI: focus indicators and filled controls against their surroundings. */
const nonTextPairs: Pair[] = [
  ['focusRing', 'background'],
  ['focusRing', 'surface'],
  ['primary', 'surface'],
];

describe.each(Object.values(themes))('$name theme', (theme) => {
  it.each(textPairs)('%s on %s meets 4.5:1 for text', (foreground, background) => {
    expect(
      contrastRatio(theme.colors[foreground], theme.colors[background]),
    ).toBeGreaterThanOrEqual(minContrast.text);
  });

  it.each(nonTextPairs)('%s on %s meets 3:1 for non-text UI', (foreground, background) => {
    expect(
      contrastRatio(theme.colors[foreground], theme.colors[background]),
    ).toBeGreaterThanOrEqual(minContrast.nonText);
  });

  it('uses #RRGGBB for every colour except the scrim', () => {
    const { scrim: _scrim, ...solid } = theme.colors;
    for (const value of Object.values(solid)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

it('defines the same colour roles in every theme', () => {
  const [first, ...rest] = Object.values(themes).map((theme) => Object.keys(theme.colors).sort());
  for (const keys of rest) {
    expect(keys).toEqual(first);
  }
});
