import '../i18n';

import { ThemeProvider, useTheme } from '@exam-quest/ui';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSessionSync } from '../features/auth/session';
import { useReminderSync } from '../features/reminders/useReminderSync';
import { useSettings, useSettingsHydrated } from '../features/settings/store';
import { configureNotificationHandler } from '../services/notifications';
import { fontAssets } from '../theme/fonts';

void SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

function ThemedStack() {
  const theme = useTheme();
  useReminderSync();
  useSessionSync();
  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="exams/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const settingsReady = useSettingsHydrated();
  const appearance = useSettings((state) => state.appearance);
  const calm = useSettings((state) => state.calm);
  // If fonts fail to load, continue with system fonts rather than blocking the app.
  const ready = (fontsLoaded || fontError !== null) && settingsReady;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider appearance={appearance} calm={calm}>
        <ThemedStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
