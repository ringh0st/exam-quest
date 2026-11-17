import { useState } from 'react';
import { TextInput, View, useWindowDimensions, type TextInputProps } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { textStyle } from '../tokens/typography';
import { ErrorText } from './ErrorText';
import { Text } from './Text';

export interface TextFieldProps extends Pick<
  TextInputProps,
  | 'autoFocus'
  | 'maxLength'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'autoCorrect'
  | 'keyboardType'
  | 'textContentType'
  | 'returnKeyType'
  | 'onSubmitEditing'
> {
  /** Visible label, also the accessible name. Placeholders are never used instead of labels. */
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Helper text under the field, also read by screen readers. */
  hint?: string | undefined;
  /** Error message; shown under the field and announced when it appears. */
  error?: string | undefined;
  placeholder?: string;
  multiline?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  hint,
  error,
  placeholder,
  multiline = false,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const styles = useStyles();
  const { fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  const description = [error, hint].filter(Boolean).join('. ');

  return (
    <View style={styles.root}>
      <Text variant="label">{label}</Text>
      <TextInput
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={description || undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            fontFamily: theme.fonts.regular,
            lineHeight: textStyle.body.lineHeight * fontScale,
            borderColor: error
              ? theme.colors.onDangerSurface
              : focused
                ? theme.colors.focusRing
                : theme.colors.border,
          },
          multiline && styles.multiline,
        ]}
      />
      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.space[2] },
  input: {
    minHeight: t.size.minTouchTarget,
    paddingHorizontal: t.space[4],
    paddingVertical: t.space[3],
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.strong,
    backgroundColor: t.colors.surface,
    color: t.colors.text,
    fontSize: t.textStyle.body.fontSize,
  },
  multiline: { minHeight: t.size.minTouchTarget * 2, textAlignVertical: 'top' },
}));
