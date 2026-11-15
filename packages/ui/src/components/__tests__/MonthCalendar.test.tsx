import { render, screen, userEvent } from '@testing-library/react-native';

import { MonthCalendar, type CalendarDay } from '../MonthCalendar';

const day = (n: number, extra: Partial<CalendarDay> = {}): CalendarDay => ({
  key: `2026-11-${String(n).padStart(2, '0')}`,
  label: String(n),
  accessibilityLabel: `November ${n}`,
  marked: false,
  selected: false,
  today: false,
  ...extra,
});

function setup(onSelectDay = jest.fn(), onNext = jest.fn()) {
  return render(
    <MonthCalendar
      title="November 2026"
      weekdayLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
      weeks={[
        [null, null, null, null, null, null, day(1)],
        [
          day(2),
          day(3),
          day(4),
          day(5),
          day(6, { marked: true, accessibilityLabel: 'November 6: Biology', selected: true }),
          day(7),
          day(8),
        ],
      ]}
      onSelectDay={onSelectDay}
      previousLabel="Previous month"
      nextLabel="Next month"
      onPrevious={jest.fn()}
      onNext={onNext}
    />,
  );
}

describe('MonthCalendar', () => {
  it('names each day for screen readers, including its events', async () => {
    await setup();
    expect(screen.getByRole('header', { name: 'November 2026' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'November 6: Biology' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'November 1' })).not.toBeSelected();
  });

  it('reports the selected day and month navigation', async () => {
    const onSelectDay = jest.fn();
    const onNext = jest.fn();
    const user = userEvent.setup();
    await setup(onSelectDay, onNext);

    await user.press(screen.getByRole('button', { name: 'November 3' }));
    expect(onSelectDay).toHaveBeenCalledWith('2026-11-03');
    await user.press(screen.getByRole('button', { name: 'Next month' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('hides the weekday header row from screen readers (each day already names its weekday)', async () => {
    await setup();
    expect(screen.queryByText('Mon')).toBeNull();
    expect(screen.getByText('Mon', { includeHiddenElements: true })).toBeTruthy();
  });
});
