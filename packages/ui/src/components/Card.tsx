import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/types';

export type CardTone = 'surface' | 'sunken' | 'success' | 'warning' | 'danger';

const toneBackground: Record<CardTone, keyof ThemeColors> = {
  surface: 'surface',
  sunken: 'surfaceSunken',
  success: 'successSurface',
  warning: 'warningSurface',
  danger: 'dangerSurface',
};

interface BaseCardProps {
  children: ReactNode;
  tone?: CardTone;
  /** Game-style raised edge. Hidden automatically in calm mode. */
  raised?: boolean;
}

/** A tappable card needs a label that describes the whole card for screen readers. */
export type CardProps = BaseCardProps &
  (
    | { onPress?: undefined; accessibilityLabel?: undefined; accessibilityHint?: undefined }
    | { onPress: () => void; accessibilityLabel: string; accessibilityHint?: string }
  );

export function Card({
  children,
  tone = 'surface',
  raised = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const theme = useTheme();
  const styles = useStyles();
  const style = [
    styles.card,
    { backgroundColor: theme.colors[toneBackground[tone]] },
    raised && theme.playful ? styles.raised : null,
  ];

  if (!onPress) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    borderRadius: t.radius.xl,
    borderWidth: t.borderWidth.regular,
    borderColor: t.colors.border,
    padding: t.space[4],
    gap: t.space[2],
  },
  raised: {
    borderColor: t.colors.text,
    borderBottomWidth: t.size.raisedEdge,
  },
  pressed: { opacity: 0.85 },
}));
