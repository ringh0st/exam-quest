import { EmptyState, Screen, Text } from '@exam-quest/ui';
import { useTranslation } from 'react-i18next';

export default function ExamsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('exams.title')}</Text>
      <EmptyState title={t('exams.emptyTitle')} body={t('exams.emptyBody')} />
    </Screen>
  );
}
