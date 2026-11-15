import { Pressable } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { Text } from './Text';

export interface ChipProps {
  /** Visible text, also used as the accessible name. */
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
}

/** A selectable option, e.g. a subject or a date shortcut. Selection is announced, not only shown. */
export function Chip({ label, selected = false, onPress, accessibilityHint }: ChipProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <Text variant="label" color={selected ? 'onPrimary' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    minHeight: t.size.minTouchTarget,
    paddingHorizontal: t.space[4],
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.regular,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  selected: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
  unselected: { backgroundColor: t.colors.surface, borderColor: t.colors.border },
  pressed: { opacity: 0.85 },
}));
