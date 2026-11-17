import {
  Button,
  Card,
  Chip,
  ProgressBar,
  Text,
  ThemeProvider,
  Checkbox,
  ToggleRow,
  makeStyles,
} from '@exam-quest/ui';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Component preview for development builds. Open it at /dev/components. */
export default function ComponentPreviewScreen() {
  const [calm, setCalm] = useState(false);

  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return (
    <ThemeProvider calm={calm}>
      <Preview calm={calm} onCalmChange={setCalm} />
    </ThemeProvider>
  );
}

function Preview({
  calm,
  onCalmChange,
}: {
  calm: boolean;
  onCalmChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [subject, setSubject] = useState<'biology' | 'math' | 'history'>('biology');
  const [agreed, setAgreed] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="title">{t('dev.components.title')}</Text>
        <Text color="textMuted">{t('dev.components.intro')}</Text>

        <ToggleRow
          label={t('dev.components.calmMode')}
          description={t('dev.components.calmModeDescription')}
          value={calm}
          onValueChange={onCalmChange}
        />

        <Checkbox
          label={t('dev.components.checkbox')}
          description={t('dev.components.checkboxDescription')}
          checked={agreed}
          onCheckedChange={setAgreed}
        />

        <Text variant="heading">{t('dev.components.text')}</Text>
        <Text variant="display">{t('dev.components.sample.display')}</Text>
        <Text variant="title">{t('dev.components.sample.title')}</Text>
        <Text variant="heading">{t('dev.components.sample.heading')}</Text>
        <Text>{t('dev.components.sample.body')}</Text>
        <Text variant="caption" color="textMuted">
          {t('dev.components.sample.caption')}
        </Text>

        <Text variant="heading">{t('dev.components.buttons')}</Text>
        <View style={styles.column}>
          <Button label={t('dev.components.startLevel')} onPress={noop} fullWidth />
          <Button label={t('dev.components.addExam')} variant="accent" onPress={noop} fullWidth />
          <Button label={t('dev.components.later')} variant="secondary" onPress={noop} />
          <Button label={t('dev.components.skip')} variant="quiet" onPress={noop} />
          <Button label={t('dev.components.saving')} onPress={noop} loading />
          <Button label={t('dev.components.startLevel')} onPress={noop} disabled />
        </View>

        <Text variant="heading">{t('dev.components.chips')}</Text>
        <View style={styles.row}>
          {(['biology', 'math', 'history'] as const).map((key) => (
            <Chip
              key={key}
              label={t(`dev.components.${key}`)}
              selected={subject === key}
              onPress={() => setSubject(key)}
            />
          ))}
        </View>

        <Text variant="heading">{t('dev.components.progress')}</Text>
        <ProgressBar value={0.7} accessibilityLabel={t('dev.components.readiness')} />
        <ProgressBar value={0.4} tone="accent" accessibilityLabel={t('dev.components.readiness')} />

        <Text variant="heading">{t('dev.components.cards')}</Text>
        <Card raised>
          <Text variant="heading">{t('dev.components.cardTitle')}</Text>
          <Text color="textMuted">{t('dev.components.cardBody')}</Text>
        </Card>
        <Card
          tone="success"
          onPress={noop}
          accessibilityLabel={`${t('dev.components.cardTitle')}, ${t('dev.components.cardBody')}`}
        >
          <Text color="onSuccessSurface">{t('dev.components.cardBody')}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function noop() {}

const useStyles = makeStyles((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.space[4], gap: theme.space[4] },
  column: { gap: theme.space[3] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
}));
