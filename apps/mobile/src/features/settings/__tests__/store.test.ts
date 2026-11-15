import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultSettings, useSettings } from '../store';

beforeEach(async () => {
  await AsyncStorage.clear();
  useSettings.setState(defaultSettings);
});

describe('settings store', () => {
  it('starts with system appearance, calm mode off and lessons in the source language', () => {
    expect(useSettings.getState()).toMatchObject({
      appearance: 'system',
      calm: false,
      lessonLanguage: 'source',
      country: 'FI',
    });
  });

  it('updates and saves settings on the device', async () => {
    useSettings.getState().setCalm(true);
    useSettings.getState().setAppearance('dark');

    expect(useSettings.getState()).toMatchObject({ calm: true, appearance: 'dark' });
    const saved = JSON.parse((await AsyncStorage.getItem('settings')) ?? '{}') as {
      state: Record<string, unknown>;
    };
    expect(saved.state).toMatchObject({ calm: true, appearance: 'dark' });
    expect(saved.state).not.toHaveProperty('setCalm');
  });

  it('restores saved settings', async () => {
    await AsyncStorage.setItem(
      'settings',
      JSON.stringify({ state: { calm: true, lessonLanguage: 'en' }, version: 1 }),
    );
    await useSettings.persist.rehydrate();
    expect(useSettings.getState()).toMatchObject({ calm: true, lessonLanguage: 'en' });
  });
});
