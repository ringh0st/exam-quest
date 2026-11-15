/** WCAG 2.x relative luminance of a `#RRGGBB` colour. */
export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1]) {
    throw new Error(`Expected a #RRGGBB colour, got "${hex}"`);
  }
  const value = match[1];
  const [r, g, b] = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two `#RRGGBB` colours (1 to 21). */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Minimum ratios from WCAG 2.2 AA. */
export const minContrast = {
  /** Body text (1.4.3). */
  text: 4.5,
  /** Large text (≥ 24 pt, or ≥ 18.66 pt bold) (1.4.3). */
  largeText: 3,
  /** Icons, focus indicators and other meaningful non-text UI (1.4.11). */
  nonText: 3,
} as const;
