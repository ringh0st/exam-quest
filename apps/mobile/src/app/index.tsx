import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Temporary placeholder screen. It uses platform defaults on purpose: colours, type and spacing
// come from the design system (`@exam-quest/ui`) once its tokens land.
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text accessibilityRole="header">{t('home.title')}</Text>
        <Text>{t('home.subtitle')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
