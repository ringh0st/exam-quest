import '../i18n';

import { ThemeProvider, useTheme } from '@exam-quest/ui';
import { useFonts } from 'expo-font';
import { Stack, router, usePathname, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSession, useSessionSync } from '../features/auth/session';
import { useReminderSync } from '../features/reminders/useReminderSync';
import { useSettings, useSettingsHydrated } from '../features/settings/store';
import { configureNotificationHandler } from '../services/notifications';
import { fontAssets } from '../theme/fonts';

void SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

/** A signed-in student who hasn't accepted the current terms is sent to the welcome step. */
function useConsentGate() {
  const consentNeeded = useSession(
    (state) => state.status === 'signedIn' && state.consent === 'needed',
  );
  const pathname = usePathname();
  // Navigating before the root navigator has mounted throws, so wait for it.
  const navigationReady = Boolean(useRootNavigationState()?.key);
  useEffect(() => {
    if (navigationReady && consentNeeded && pathname !== '/welcome') router.replace('/welcome');
  }, [navigationReady, consentNeeded, pathname]);
}

function ThemedStack() {
  const theme = useTheme();
  useReminderSync();
  useSessionSync();
  useConsentGate();
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
        <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
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
