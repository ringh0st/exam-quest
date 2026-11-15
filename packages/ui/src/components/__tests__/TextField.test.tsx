import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { TextField } from '../TextField';

function Controlled({ error }: { error?: string }) {
  const [value, setValue] = useState('');
  return (
    <TextField
      label="Topic"
      hint="For example: Chemical bonds"
      value={value}
      onChangeText={setValue}
      {...(error ? { error } : {})}
    />
  );
}

describe('TextField', () => {
  it('is named by its visible label and accepts typing', async () => {
    const user = userEvent.setup();
    await render(<Controlled />);

    const input = screen.getByLabelText('Topic');
    await user.type(input, 'Cells');
    expect(input).toHaveDisplayValue('Cells');
    expect(screen.getByText('Topic')).toBeOnTheScreen();
  });

  it('reads the hint to screen readers', async () => {
    await render(<Controlled />);
    expect(screen.getByLabelText('Topic')).toHaveProp(
      'accessibilityHint',
      'For example: Chemical bonds',
    );
  });

  it('shows and announces an error instead of the hint', async () => {
    await render(<Controlled error="Enter a subject name" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a subject name');
    expect(screen.getByLabelText('Topic')).toHaveProp(
      'accessibilityHint',
      'Enter a subject name. For example: Chemical bonds',
    );
  });
});
