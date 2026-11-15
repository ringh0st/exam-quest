import { contrastRatio, relativeLuminance } from '../contrast';

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    // Commonly cited: #767676 on white is the lightest grey that passes 4.5:1.
    expect(contrastRatio('#767676', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#5B2EFF', '#F7F5FF')).toBeCloseTo(contrastRatio('#F7F5FF', '#5B2EFF'));
  });

  it('rejects colours that are not #RRGGBB', () => {
    expect(() => relativeLuminance('red')).toThrow();
    expect(() => relativeLuminance('#FFF')).toThrow();
  });
});
