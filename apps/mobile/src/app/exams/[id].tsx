import { Button, Card, EmptyState, Screen, Text, makeStyles } from '@exam-quest/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { today } from '../../features/exams/dates';
import { daysUntil } from '../../features/exams/model';
import { useExam, useExams } from '../../features/exams/store';
import { useExamText } from '../../features/exams/useExamText';

export default function ExamDetailScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const text = useExamText();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exam = useExam(id);
  const removeExam = useExams((state) => state.removeExam);
  const [confirming, setConfirming] = useState(false);

  const back = (
    <Button label={t('exams.detail.back')} variant="quiet" onPress={() => router.back()} />
  );

  if (!exam) {
    return (
      <Screen>
        {back}
        <EmptyState title={t('exams.detail.notFoundTitle')} body={t('exams.detail.notFoundBody')} />
      </Screen>
    );
  }

  const remove = () => {
    removeExam(exam.id);
    router.back();
  };

  return (
    <Screen>
      {back}
      <View style={styles.heading}>
        <Text variant="title">{text.subjectName(exam.subject)}</Text>
        <Text variant="bodyStrong" color="primary">
          {t('exams.dateAndCountdown', {
            date: text.longDate(exam),
            countdown: text.countdown(daysUntil(exam, today())),
          })}
        </Text>
      </View>

      {exam.topic ? (
        <Card tone="sunken">
          <Text variant="overline" color="textMuted">
            {t('exams.detail.topic')}
          </Text>
          <Text>{exam.topic}</Text>
        </Card>
      ) : null}

      {confirming ? (
        <Card tone="danger">
          <Text variant="heading" color="onDangerSurface">
            {t('exams.detail.deleteConfirmTitle')}
          </Text>
          <Text color="onDangerSurface">{t('exams.detail.deleteConfirmBody')}</Text>
          <View style={styles.actions}>
            <Button label={t('exams.detail.deleteConfirm')} variant="accent" onPress={remove} />
            <Button
              label={t('exams.detail.keep')}
              variant="secondary"
              onPress={() => setConfirming(false)}
            />
          </View>
        </Card>
      ) : (
        <Button
          label={t('exams.detail.delete')}
          variant="secondary"
          onPress={() => setConfirming(true)}
        />
      )}
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  heading: { gap: theme.space[2] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] },
}));
