import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { Checkbox } from '../Checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="I am 13 or older"
      description="Required to use the app"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

describe('Checkbox', () => {
  it('is one checkbox that announces and toggles its state', async () => {
    const user = userEvent.setup();
    await render(<Controlled />);

    const box = screen.getByRole('checkbox', { name: 'I am 13 or older' });
    expect(box).not.toBeChecked();
    await user.press(box);
    expect(screen.getByRole('checkbox', { name: 'I am 13 or older' })).toBeChecked();
    await user.press(screen.getByRole('checkbox', { name: 'I am 13 or older' }));
    expect(screen.getByRole('checkbox', { name: 'I am 13 or older' })).not.toBeChecked();
  });

  it('reads the description as a hint', async () => {
    await render(<Controlled />);
    expect(screen.getByRole('checkbox', { name: 'I am 13 or older' })).toHaveProp(
      'accessibilityHint',
      'Required to use the app',
    );
  });

  it('does nothing when disabled', async () => {
    const onCheckedChange = jest.fn();
    const user = userEvent.setup();
    await render(
      <Checkbox label="Terms" checked={false} onCheckedChange={onCheckedChange} disabled />,
    );
    await user.press(screen.getByRole('checkbox', { name: 'Terms' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
