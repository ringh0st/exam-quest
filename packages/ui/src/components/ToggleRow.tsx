import { Pressable, Switch, View } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface ToggleRowProps {
  /** Visible text, also used as the accessible name. */
  label: string;
  /** Optional second line, read after the label. */
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * A settings row with a switch. The whole row is one target and one screen-reader element
 * (role "switch" with its on/off state), so the small native switch is never the only target.
 */
export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ToggleRowProps) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
      style={styles.row}
    >
      <View style={styles.text}>
        <Text variant="bodyStrong" color={disabled ? 'textDisabled' : 'text'}>
          {label}
        </Text>
        {description ? (
          <Text variant="caption" color={disabled ? 'textDisabled' : 'textMuted'}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Switch
          value={value}
          disabled={disabled}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
          ios_backgroundColor={theme.colors.border}
        />
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    minHeight: t.size.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space[3],
    paddingVertical: t.space[2],
  },
  text: { flex: 1, gap: t.space[1] },
}));
