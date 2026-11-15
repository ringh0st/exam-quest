import { ActivityIndicator, Pressable, View } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/types';
import { useReducedMotion } from '../theme/useReducedMotion';
import { Text, type TextColor } from './Text';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'quiet';

export interface ButtonProps {
  /** Visible text, also used as the accessible name. */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Shows a spinner, blocks presses and tells screen readers the button is busy. */
  loading?: boolean;
  /** Extra context for screen readers, e.g. what happens after pressing. */
  accessibilityHint?: string;
  /** Stretch to the width of the parent. */
  fullWidth?: boolean;
}

interface VariantColors {
  background: keyof ThemeColors | null;
  text: TextColor;
  edge: keyof ThemeColors | null;
  border: keyof ThemeColors | null;
}

const variantColors: Record<ButtonVariant, VariantColors> = {
  primary: { background: 'primary', text: 'onPrimary', edge: 'primaryEdge', border: null },
  accent: { background: 'accent', text: 'onAccent', edge: 'accentEdge', border: null },
  secondary: { background: 'surface', text: 'primary', edge: 'border', border: 'border' },
  quiet: { background: null, text: 'primary', edge: null, border: null },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityHint,
  fullWidth = false,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useStyles();
  const reducedMotion = useReducedMotion();
  const inactive = disabled || loading;
  const colors = variantColors[variant];
  const showEdge = theme.playful && colors.edge !== null && !inactive;

  const face = inactive
    ? theme.colors.surfaceSunken
    : colors.background
      ? theme.colors[colors.background]
      : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.target,
        fullWidth && styles.fullWidth,
        showEdge && colors.edge
          ? { backgroundColor: theme.colors[colors.edge], paddingBottom: theme.size.raisedEdge }
          : null,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.face,
            {
              backgroundColor: face,
              borderColor: colors.border ? theme.colors[colors.border] : face,
            },
            pressed && !inactive && (showEdge && !reducedMotion ? styles.pressed : styles.dimmed),
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors[colors.text]} accessibilityElementsHidden />
          ) : null}
          <Text variant="bodyStrong" color={inactive ? 'textDisabled' : colors.text} align="center">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  target: {
    minHeight: t.size.minTouchTarget,
    minWidth: t.size.minTouchTarget,
    borderRadius: t.radius.xl,
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  face: {
    flexGrow: 1,
    minHeight: t.size.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space[2],
    paddingHorizontal: t.space[5],
    paddingVertical: t.space[3],
    borderRadius: t.radius.xl,
    borderWidth: t.borderWidth.strong,
  },
  /** Face slides down onto its raised edge. */
  pressed: { transform: [{ translateY: t.size.raisedEdge }] },
  /** Feedback without motion (reduced motion, or no raised edge). */
  dimmed: { opacity: 0.85 },
}));
