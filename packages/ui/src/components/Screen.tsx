import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { makeStyles } from '../theme/makeStyles';

export interface ScreenProps {
  children: ReactNode;
  /** Scroll the content (default). Turn off for screens that manage their own scrolling. */
  scroll?: boolean;
  /** Safe-area edges to pad. Tab screens leave the bottom to the tab bar. */
  edges?: readonly Edge[];
}

/** Page wrapper: theme background, safe areas, standard padding and spacing. */
export function Screen({ children, scroll = true, edges = ['top'] }: ScreenProps) {
  const styles = useStyles();
  return (
    <SafeAreaView edges={edges} style={styles.root}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.background },
  content: { padding: t.space[4], gap: t.space[4], flexGrow: 1 },
  fill: { flex: 1 },
}));
