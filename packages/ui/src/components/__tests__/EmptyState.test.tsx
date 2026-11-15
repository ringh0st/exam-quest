import { render, screen, userEvent } from '@testing-library/react-native';

import { EmptyState } from '../EmptyState';
import { Screen } from '../Screen';

describe('EmptyState', () => {
  it('shows a heading, body and an action button', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(
      <Screen>
        <EmptyState
          title="No exams yet"
          body="Add your next exam to get a study plan."
          action={{ label: 'Add exam', onPress }}
        />
      </Screen>,
    );

    expect(screen.getByRole('header', { name: 'No exams yet' })).toBeOnTheScreen();
    expect(screen.getByText('Add your next exam to get a study plan.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Add exam' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('works without an action', async () => {
    await render(<EmptyState title="Nothing here" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
