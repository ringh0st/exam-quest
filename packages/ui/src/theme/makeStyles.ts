import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme, type ThemeValue } from './ThemeProvider';

/** A map of style names to style objects (React Native 0.88 no longer exports this type). */
export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Creates a hook that returns theme-aware styles, recomputed only when the theme changes.
 *
 * ```ts
 * const useStyles = makeStyles((t) => ({
 *   card: { backgroundColor: t.colors.surface, padding: t.space[4], borderRadius: t.radius.lg },
 * }));
 * ```
 */
export function makeStyles<T extends NamedStyles<T>>(factory: (theme: ThemeValue) => T) {
  return function useStyles(): Readonly<T> {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
