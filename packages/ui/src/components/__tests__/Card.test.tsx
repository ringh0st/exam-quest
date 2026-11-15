import { render, screen, userEvent } from '@testing-library/react-native';

import { Card } from '../Card';
import { Text } from '../Text';

describe('Card', () => {
  it('is not interactive without onPress', async () => {
    await render(
      <Card>
        <Text>Biology test</Text>
      </Card>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Biology test')).toBeOnTheScreen();
  });

  it('becomes one labelled button when tappable', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(
      <Card onPress={onPress} accessibilityLabel="Biology test, Friday, 70% ready">
        <Text>Biology test</Text>
      </Card>,
    );
    await user.press(screen.getByRole('button', { name: 'Biology test, Friday, 70% ready' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
