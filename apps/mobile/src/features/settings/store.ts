import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Appearance } from '@exam-quest/ui';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appConfig } from '../../config/appConfig';
import { defaultCountry, type CountryCode } from '../../countries';

/** Which language lessons are written in: the material's own language, or always English. */
export type LessonLanguage = 'source' | 'en';

export interface SettingsState {
  appearance: Appearance;
  calm: boolean;
  lessonLanguage: LessonLanguage;
  country: CountryCode;
  /** Off until the student turns reminders on (and grants permission). */
  remindersEnabled: boolean;
  studyTime: string;
  setAppearance: (appearance: Appearance) => void;
  setCalm: (calm: boolean) => void;
  setLessonLanguage: (language: LessonLanguage) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setStudyTime: (time: string) => void;
}

export const defaultSettings = {
  appearance: 'system',
  calm: false,
  lessonLanguage: 'source',
  country: defaultCountry,
  remindersEnabled: false,
  studyTime: appConfig.notifications.defaultStudyTime,
} as const satisfies Pick<
  SettingsState,
  'appearance' | 'calm' | 'lessonLanguage' | 'country' | 'remindersEnabled' | 'studyTime'
>;

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setAppearance: (appearance) => set({ appearance }),
      setCalm: (calm) => set({ calm }),
      setLessonLanguage: (lessonLanguage) => set({ lessonLanguage }),
      setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),
      setStudyTime: (studyTime) => set({ studyTime }),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ appearance, calm, lessonLanguage, country, remindersEnabled, studyTime }) => ({
        appearance,
        calm,
        lessonLanguage,
        country,
        remindersEnabled,
        studyTime,
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
