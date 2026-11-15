import { Text, makeStyles } from '@exam-quest/ui';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder home screen until the app shell (tabs) lands.
export default function HomeScreen() {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text variant="title" align="center">
          {t('home.title')}
        </Text>
        <Text color="textMuted" align="center">
          {t('home.subtitle')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
  },
}));
