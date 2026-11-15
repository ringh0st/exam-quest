import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { defaultSettings, useSettings } from '../../features/settings/store';
import en from '../../i18n/locales/en.json';

beforeEach(async () => {
  await AsyncStorage.clear();
  useSettings.setState(defaultSettings);
});

describe('app shell', () => {
  it('opens on the quests tab with all five tabs available', async () => {
    const router = await renderRouter('./src/app', { initialUrl: '/' });

    expect(router.getPathname()).toBe('/');
    expect(await screen.findByRole('header', { name: en.quests.title })).toBeOnTheScreen();
    // React Navigation labels each tab "<name>, tab, <n> of 5" so screen readers hear position.
    Object.values(en.tabs).forEach((tab, index) => {
      expect(
        screen.getByRole('button', { name: `${tab}, tab, ${index + 1} of 5` }),
      ).toBeOnTheScreen();
    });
  });

  it('takes a new student from the empty quest map to the exams tab', async () => {
    const user = userEvent.setup();
    const router = await renderRouter('./src/app', { initialUrl: '/' });

    await user.press(await screen.findByRole('button', { name: en.quests.emptyAction }));
    expect(router.getPathname()).toBe('/exams');
    expect(await screen.findByRole('header', { name: en.exams.title })).toBeOnTheScreen();
  });

  it('turns on calm mode from the Me tab and saves it', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/me' });

    await user.press(await screen.findByRole('switch', { name: en.me.calmMode }));
    expect(screen.getByRole('switch', { name: en.me.calmMode })).toBeChecked();
    expect(useSettings.getState().calm).toBe(true);
  });

  it('marks the chosen appearance as selected', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/me' });

    await user.press(await screen.findByRole('button', { name: en.me.appearanceOptions.dark }));
    expect(screen.getByRole('button', { name: en.me.appearanceOptions.dark })).toBeSelected();
    expect(screen.getByRole('button', { name: en.me.appearanceOptions.system })).not.toBeSelected();
  });
});
