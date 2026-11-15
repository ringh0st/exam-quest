import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { addDays, today } from '../../features/exams/dates';
import { useExams } from '../../features/exams/store';
import { defaultSettings, useSettings } from '../../features/settings/store';
import en from '../../i18n/locales/en.json';
import {
  cancelScheduledNotifications,
  ensureNotificationPermission,
  replaceScheduledNotifications,
} from '../../services/notifications';

const replaceMock = jest.mocked(replaceScheduledNotifications);
const permissionMock = jest.mocked(ensureNotificationPermission);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  useSettings.setState(defaultSettings);
  useExams.setState({
    exams: [
      {
        id: 'bio',
        subject: { kind: 'known', id: 'biology' },
        date: addDays(today(), 10),
        createdAt: '2026-11-01T00:00:00Z',
      },
    ],
  });
});

describe('reminders', () => {
  it('are off by default and scheduled once the student turns them on', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/me' });
    expect(replaceMock).not.toHaveBeenCalled();

    await user.press(await screen.findByRole('switch', { name: en.me.reminders }));

    expect(screen.getByRole('switch', { name: en.me.reminders })).toBeChecked();
    await waitFor(() => expect(replaceMock).toHaveBeenCalled());
    const scheduled = replaceMock.mock.lastCall?.[0] ?? [];
    expect(scheduled.map((n) => n.title)).toEqual(
      expect.arrayContaining([
        `${en.subjects.biology} in a week`,
        `${en.subjects.biology} tomorrow`,
      ]),
    );
  });

  it('explains how to fix it when notification permission is refused', async () => {
    permissionMock.mockResolvedValueOnce(false);
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/me' });

    await user.press(await screen.findByRole('switch', { name: en.me.reminders }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.me.permissionDenied);
    expect(screen.getByRole('switch', { name: en.me.reminders })).not.toBeChecked();
    expect(useSettings.getState().remindersEnabled).toBe(false);
  });

  it('lets the student choose the study time and cancels reminders when turned off', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/me' });
    await user.press(await screen.findByRole('switch', { name: en.me.reminders }));

    await user.press(screen.getByRole('button', { name: '19:00' }));
    expect(useSettings.getState().studyTime).toBe('19:00');
    await waitFor(() =>
      expect(replaceMock.mock.lastCall?.[0].some((n) => n.time === '19:00')).toBe(true),
    );

    await user.press(screen.getByRole('switch', { name: en.me.reminders }));
    await waitFor(() => expect(cancelScheduledNotifications).toHaveBeenCalled());
  });
});
