import type { ReactNode } from 'react';
import {
  Text as NativeText,
  useWindowDimensions,
  type AccessibilityRole,
  type TextProps as NativeTextProps,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/types';
import { textStyle, type TextVariant } from '../tokens/typography';

/** Colour roles that are tested for text contrast on their matching backgrounds. */
export type TextColor = Extract<
  keyof ThemeColors,
  | 'text'
  | 'textMuted'
  | 'textDisabled'
  | 'primary'
  | 'onPrimary'
  | 'onAccent'
  | 'onSuccess'
  | 'onSuccessSurface'
  | 'onWarning'
  | 'onWarningSurface'
  | 'onDangerSurface'
>;

const headerVariants: ReadonlySet<TextVariant> = new Set(['display', 'title', 'heading']);

export interface TextProps extends Pick<
  NativeTextProps,
  'numberOfLines' | 'selectable' | 'accessibilityLabel' | 'accessibilityHint' | 'testID'
> {
  children: ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  align?: 'auto' | 'left' | 'center' | 'right';
  /** Defaults to `header` for display, title and heading variants. */
  accessibilityRole?: AccessibilityRole;
}

/**
 * The only text component. It follows the system font size without a cap, and scales line
 * height with it so large text never overlaps.
 */
export function Text({
  children,
  variant = 'body',
  color = 'text',
  align = 'auto',
  accessibilityRole,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();
  const { weight, lineHeight, ...type } = textStyle[variant];

  return (
    <NativeText
      {...rest}
      accessibilityRole={accessibilityRole ?? (headerVariants.has(variant) ? 'header' : undefined)}
      style={{
        ...type,
        lineHeight: lineHeight * fontScale,
        fontFamily: theme.fonts[weight],
        color: theme.colors[color],
        textAlign: align,
      }}
    >
      {children}
    </NativeText>
  );
}
