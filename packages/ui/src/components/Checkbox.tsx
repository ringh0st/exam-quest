import { Pressable, View } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { Text } from './Text';

export interface CheckboxProps {
  /** Visible text, also the accessible name. Can be a full sentence (e.g. a consent statement). */
  label: string;
  /** Optional second line, read after the label. */
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * A checkbox row for confirmations and consent. The whole row is one target (at least 48 dp) and
 * one screen-reader element with role "checkbox" and its checked state. Checked is shown by a
 * filled box *and* a tick, never by colour alone.
 */
export function Checkbox({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: CheckboxProps) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked, disabled }}
      style={styles.row}
    >
      <View
        style={[styles.box, checked && styles.boxChecked, disabled && styles.boxDisabled]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {checked ? <View style={styles.tick} /> : null}
      </View>
      <View style={styles.text}>
        <Text color={disabled ? 'textDisabled' : 'text'}>{label}</Text>
        {description ? (
          <Text variant="caption" color={disabled ? 'textDisabled' : 'textMuted'}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    minHeight: t.size.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.space[3],
    paddingVertical: t.space[3],
  },
  box: {
    width: t.size.checkbox.box,
    height: t.size.checkbox.box,
    borderRadius: t.radius.sm,
    borderWidth: t.borderWidth.regular,
    borderColor: t.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
  boxDisabled: { borderColor: t.colors.textDisabled },
  tick: {
    width: t.size.checkbox.tickWidth,
    height: t.size.checkbox.tickHeight,
    borderColor: t.colors.onPrimary,
    borderRightWidth: t.borderWidth.strong,
    borderBottomWidth: t.borderWidth.strong,
    // Nudge up so the rotated tick sits in the visual centre of the box.
    marginTop: -t.borderWidth.regular,
    transform: [{ rotate: '45deg' }],
  },
  text: { flex: 1, gap: t.space[1] },
}));
