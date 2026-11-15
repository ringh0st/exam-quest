import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { today } from '../../features/exams/dates';
import { formatExamDateLong } from '../../features/exams/format';
import { useExams } from '../../features/exams/store';
import en from '../../i18n/locales/en.json';

beforeEach(async () => {
  await AsyncStorage.clear();
  useExams.setState({
    exams: [
      {
        id: 'bio',
        subject: { kind: 'known', id: 'biology' },
        date: today(),
        createdAt: '2026-11-01T00:00:00Z',
      },
    ],
  });
});

describe('exam calendar', () => {
  it("shows today's exam on the calendar and names it for screen readers", async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/exams' });

    await user.press(await screen.findByRole('button', { name: en.exams.view.calendar }));
    const todayLabel = `${formatExamDateLong(today(), 'en')}: ${en.subjects.biology}`;
    expect(screen.getByRole('button', { name: todayLabel })).toBeSelected();
    // The selected day's exam is listed under the calendar.
    expect(
      screen.getByRole('button', { name: new RegExp(`^${en.subjects.biology}, `) }),
    ).toBeOnTheScreen();
  });

  it('shows an empty message for a day without exams', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/exams' });
    await user.press(await screen.findByRole('button', { name: en.exams.view.calendar }));
    await user.press(screen.getByRole('button', { name: en.exams.calendar.next }));

    const [firstDay] = screen.getAllByRole('button', { name: /^\w+day, / });
    expect(firstDay).toBeTruthy();
    if (firstDay) await user.press(firstDay);
    expect(screen.getByText(/^No exams on /)).toBeOnTheScreen();
  });
});
