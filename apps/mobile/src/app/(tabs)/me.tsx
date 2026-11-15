import {
  Card,
  Chip,
  ErrorText,
  Screen,
  Text,
  ToggleRow,
  makeStyles,
  type Appearance,
} from '@exam-quest/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { appConfig } from '../../config/appConfig';
import { useSettings, type LessonLanguage } from '../../features/settings/store';
import { ensureNotificationPermission } from '../../services/notifications';

const appearances: readonly Appearance[] = ['system', 'light', 'dark'];
const lessonLanguages: readonly LessonLanguage[] = ['source', 'en'];

export default function MeScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const settings = useSettings();
  const [permissionDenied, setPermissionDenied] = useState(false);

  const toggleReminders = async (enabled: boolean) => {
    if (!enabled) {
      settings.setRemindersEnabled(false);
      return;
    }
    const granted = await ensureNotificationPermission();
    setPermissionDenied(!granted);
    settings.setRemindersEnabled(granted);
  };

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
        <ToggleRow
          label={t('me.reminders')}
          description={t('me.remindersDescription')}
          value={settings.remindersEnabled}
          onValueChange={(enabled) => void toggleReminders(enabled)}
        />
        {permissionDenied ? <ErrorText>{t('me.permissionDenied')}</ErrorText> : null}
        {settings.remindersEnabled ? (
          <>
            <Text variant="label">{t('me.studyTime')}</Text>
            <View style={styles.chips}>
              {appConfig.notifications.studyTimeOptions.map((time) => (
                <Chip
                  key={time}
                  label={time}
                  selected={settings.studyTime === time}
                  onPress={() => settings.setStudyTime(time)}
                />
              ))}
            </View>
          </>
        ) : null}
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
