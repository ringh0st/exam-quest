import { EmptyState, Screen, Text } from '@exam-quest/ui';
import { useTranslation } from 'react-i18next';

export default function SquadScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('squad.title')}</Text>
      <EmptyState title={t('squad.emptyTitle')} body={t('squad.emptyBody')} />
    </Screen>
  );
}
