import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('is a button named by its label and calls onPress', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Start level" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Start level' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('announces and enforces the disabled state', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Send" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is busy and not pressable while loading', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Saving" onPress={onPress} loading />);

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeBusy();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('passes a hint to screen readers', async () => {
    await render(
      <Button label="Retake" onPress={jest.fn()} accessibilityHint="Opens the camera" />,
    );
    expect(screen.getByRole('button', { name: 'Retake' })).toHaveProp(
      'accessibilityHint',
      'Opens the camera',
    );
  });
});
