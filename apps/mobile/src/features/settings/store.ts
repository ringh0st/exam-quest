import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Appearance } from '@exam-quest/ui';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { defaultCountry, type CountryCode } from '../../countries';

/** Which language lessons are written in: the material's own language, or always English. */
export type LessonLanguage = 'source' | 'en';

export interface SettingsState {
  appearance: Appearance;
  calm: boolean;
  lessonLanguage: LessonLanguage;
  country: CountryCode;
  setAppearance: (appearance: Appearance) => void;
  setCalm: (calm: boolean) => void;
  setLessonLanguage: (language: LessonLanguage) => void;
}

export const defaultSettings = {
  appearance: 'system',
  calm: false,
  lessonLanguage: 'source',
  country: defaultCountry,
} as const satisfies Pick<SettingsState, 'appearance' | 'calm' | 'lessonLanguage' | 'country'>;

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setAppearance: (appearance) => set({ appearance }),
      setCalm: (calm) => set({ calm }),
      setLessonLanguage: (lessonLanguage) => set({ lessonLanguage }),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ appearance, calm, lessonLanguage, country }) => ({
        appearance,
        calm,
        lessonLanguage,
        country,
      }),
    },
  ),
);

/** True once saved settings have been read from storage (avoids a flash of the wrong theme). */
export function useSettingsHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useSettings.persist.onFinishHydration(onChange),
    () => useSettings.persist.hasHydrated(),
  );
}
