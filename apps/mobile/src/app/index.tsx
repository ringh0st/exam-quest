import { makeStyles } from '@exam-quest/ui';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder home screen. Styles come only from theme tokens; text components with font
// scaling and brand fonts arrive with the core components.
export default function HomeScreen() {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('home.title')}
        </Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
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
  title: { ...theme.textStyle.title, color: theme.colors.text, textAlign: 'center' },
  subtitle: { ...theme.textStyle.body, color: theme.colors.textMuted, textAlign: 'center' },
}));
