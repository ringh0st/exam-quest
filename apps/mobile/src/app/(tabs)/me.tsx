import { Card, Chip, Screen, Text, ToggleRow, makeStyles, type Appearance } from '@exam-quest/ui';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useSettings, type LessonLanguage } from '../../features/settings/store';

const appearances: readonly Appearance[] = ['system', 'light', 'dark'];
const lessonLanguages: readonly LessonLanguage[] = ['source', 'en'];

export default function MeScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const settings = useSettings();

  return (
    <Screen>
      <Text variant="title">{t('me.title')}</Text>

      <Card>
        <ToggleRow
          label={t('me.calmMode')}
          description={t('me.calmModeDescription')}
          value={settings.calm}
          onValueChange={settings.setCalm}
        />
      </Card>

      <Card>
        <Text variant="heading">{t('me.appearance')}</Text>
        <View style={styles.chips}>
          {appearances.map((appearance) => (
            <Chip
              key={appearance}
              label={t(`me.appearanceOptions.${appearance}`)}
              selected={settings.appearance === appearance}
              onPress={() => settings.setAppearance(appearance)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="heading">{t('me.lessonLanguage')}</Text>
        <View style={styles.chips}>
          {lessonLanguages.map((language) => (
            <Chip
              key={language}
              label={t(`me.lessonLanguageOptions.${language}`)}
              selected={settings.lessonLanguage === language}
              onPress={() => settings.setLessonLanguage(language)}
            />
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
}));
