import { View } from 'react-native';

import { makeStyles } from '../theme/makeStyles';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void; accessibilityHint?: string };
}

/** What a screen shows before there is any content: what will appear, and how to start. */
export function EmptyState({ title, body, action }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text variant="heading" align="center">
        {title}
      </Text>
      {body ? (
        <Text color="textMuted" align="center">
          {body}
        </Text>
      ) : null}
      {action ? (
        <View style={styles.action}>
          <Button
            label={action.label}
            onPress={action.onPress}
            {...(action.accessibilityHint ? { accessibilityHint: action.accessibilityHint } : {})}
          />
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: t.space[3],
    paddingVertical: t.space[8],
  },
  action: { marginTop: t.space[2] },
}));
