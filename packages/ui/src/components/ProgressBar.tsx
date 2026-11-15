import { View } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

export interface ProgressBarProps {
  /** Progress from 0 to 1. Values outside are clamped. */
  value: number;
  /** What the bar measures, e.g. "Test readiness". The percentage is announced with it. */
  accessibilityLabel: string;
  tone?: 'primary' | 'accent';
}

export function ProgressBar({ value, accessibilityLabel, tone = 'primary' }: ProgressBarProps) {
  const theme = useTheme();
  const styles = useStyles();
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const percent = Math.round(clamped * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${percent}%`, backgroundColor: theme.colors[tone] }]} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  track: {
    height: t.space[3],
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surfaceSunken,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: t.radius.pill },
}));
