import { View } from 'react-native';

import { Text } from './Text';

export interface ErrorTextProps {
  children: string;
}

/** An inline error that screen readers announce when it appears. */
export function ErrorText({ children }: ErrorTextProps) {
  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text variant="label" color="onDangerSurface">
        {children}
      </Text>
    </View>
  );
}
