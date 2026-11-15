import { Card, Screen, Text } from '@exam-quest/ui';
import { useTranslation } from 'react-i18next';

const options = ['scan', 'paste', 'topic'] as const;

export default function AddScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('add.title')}</Text>
      <Text color="textMuted">{t('add.body')}</Text>
      {options.map((option) => (
        <Card key={option} tone="sunken">
          <Text variant="heading">{t(`add.${option}`)}</Text>
          <Text color="textMuted">{t(`add.${option}Hint`)}</Text>
          <Text variant="caption" color="textMuted">
            {t('add.comingSoon')}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}
