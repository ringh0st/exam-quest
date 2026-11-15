import { render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';

import { useReducedMotion } from '../useReducedMotion';

function Probe() {
  return <Text>{useReducedMotion() ? 'reduced' : 'full'}</Text>;
}

describe('useReducedMotion', () => {
  it('reports the system setting', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await render(<Probe />);
    expect(await screen.findByText('reduced')).toBeOnTheScreen();
  });

  it('defaults to full motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(<Probe />);
    expect(await screen.findByText('full')).toBeOnTheScreen();
  });
});
