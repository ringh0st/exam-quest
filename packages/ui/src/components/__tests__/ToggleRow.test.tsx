import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { ToggleRow } from '../ToggleRow';

function Controlled() {
  const [on, setOn] = useState(false);
  return (
    <ToggleRow label="Calm mode" description="No XP or streaks" value={on} onValueChange={setOn} />
  );
}

describe('ToggleRow', () => {
  it('is one switch that announces and toggles its state', async () => {
    const user = userEvent.setup();
    await render(<Controlled />);

    const row = screen.getByRole('switch', { name: 'Calm mode' });
    expect(row).not.toBeChecked();
    await user.press(row);
    expect(screen.getByRole('switch', { name: 'Calm mode' })).toBeChecked();
  });

  it('exposes only one switch to screen readers', async () => {
    await render(<Controlled />);
    expect(screen.getAllByRole('switch')).toHaveLength(1);
  });

  it('does nothing when disabled', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    await render(
      <ToggleRow label="Leaderboard" value={false} onValueChange={onValueChange} disabled />,
    );
    await user.press(screen.getByRole('switch', { name: 'Leaderboard' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
