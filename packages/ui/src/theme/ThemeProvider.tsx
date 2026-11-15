import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { borderWidth, duration, radius, size, space, textStyle } from '../tokens';
import { calmTheme, darkTheme, lightTheme } from './themes';
import type { Theme } from './types';

export type Appearance = 'system' | 'light' | 'dark';

/** Everything a component needs to style itself: the active theme plus the shared scales. */
export interface ThemeValue extends Theme {
  space: typeof space;
  radius: typeof radius;
  borderWidth: typeof borderWidth;
  size: typeof size;
  textStyle: typeof textStyle;
  duration: typeof duration;
}

export function resolveTheme(options: {
  appearance: Appearance;
  calm: boolean;
  systemScheme: 'light' | 'dark' | null | undefined;
}): Theme {
  if (options.calm) {
    return calmTheme;
  }
  const scheme = options.appearance === 'system' ? options.systemScheme : options.appearance;
  return scheme === 'dark' ? darkTheme : lightTheme;
}

function toValue(theme: Theme): ThemeValue {
  return { ...theme, space, radius, borderWidth, size, textStyle, duration };
}

const ThemeContext = createContext<ThemeValue>(toValue(lightTheme));

export interface ThemeProviderProps {
  /** The student's choice in Settings; `system` follows the phone. */
  appearance?: Appearance;
  /** Calm mode: no game layer, quieter colours. */
  calm?: boolean;
  children: ReactNode;
}

export function ThemeProvider({
  appearance = 'system',
  calm = false,
  children,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const value = useMemo(
    () => toValue(resolveTheme({ appearance, calm, systemScheme })),
    [appearance, calm, systemScheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
