import { render, screen, userEvent } from '@testing-library/react-native';

import { Chip } from '../Chip';

describe('Chip', () => {
  it('announces whether it is selected', async () => {
    await render(
      <>
        <Chip label="Biology" selected onPress={jest.fn()} />
        <Chip label="Math" onPress={jest.fn()} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Biology' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Math' })).not.toBeSelected();
  });

  it('calls onPress', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Chip label="Tomorrow" onPress={onPress} />);
    await user.press(screen.getByRole('button', { name: 'Tomorrow' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
