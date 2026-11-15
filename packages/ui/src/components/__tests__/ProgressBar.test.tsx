import { render, screen } from '@testing-library/react-native';

import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('exposes its label and value as a progress bar', async () => {
    await render(<ProgressBar value={0.7} accessibilityLabel="Test readiness" />);
    expect(screen.getByRole('progressbar', { name: 'Test readiness' })).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 70,
    });
  });

  it.each([
    [-1, 0],
    [2, 100],
    [Number.NaN, 0],
  ])('clamps %p to %p', async (value, expected) => {
    await render(<ProgressBar value={value} accessibilityLabel="Progress" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: expected });
  });
});
