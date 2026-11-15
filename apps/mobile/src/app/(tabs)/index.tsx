import { EmptyState, Screen, Text } from '@exam-quest/ui';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function QuestsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('quests.title')}</Text>
      <EmptyState
        title={t('quests.emptyTitle')}
        body={t('quests.emptyBody')}
        action={{ label: t('quests.emptyAction'), onPress: () => router.push('/exams/new') }}
      />
    </Screen>
  );
}
