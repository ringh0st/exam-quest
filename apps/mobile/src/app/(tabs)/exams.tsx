import { Button, Card, Chip, EmptyState, Screen, Text, makeStyles } from '@exam-quest/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExamCalendar } from '../../features/exams/ExamCalendar';
import { today } from '../../features/exams/dates';
import { daysUntil, pastExams, upcomingExams, type Exam } from '../../features/exams/model';
import { useExams } from '../../features/exams/store';
import { useExamText } from '../../features/exams/useExamText';

export default function ExamsScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const exams = useExams((state) => state.exams);
  const todayDate = today();
  const upcoming = upcomingExams(exams, todayDate);
  const past = pastExams(exams, todayDate);
  const [next, ...later] = upcoming;
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const addButton = (
    <Button
      label={t('exams.add')}
      accessibilityHint={t('exams.addHint')}
      variant="accent"
      fullWidth
      onPress={() => router.push('/exams/new')}
    />
  );

  return (
    <Screen>
      <Text variant="title">{t('exams.title')}</Text>

      {exams.length === 0 ? (
        <>
          <EmptyState title={t('exams.emptyTitle')} body={t('exams.emptyBody')} />
          {addButton}
        </>
      ) : (
        <>
          <View style={styles.views}>
            {(['list', 'calendar'] as const).map((option) => (
              <Chip
                key={option}
                label={t(`exams.view.${option}`)}
                selected={view === option}
                onPress={() => setView(option)}
              />
            ))}
          </View>

          {view === 'calendar' ? (
            <ExamCalendar
              exams={exams}
              todayDate={todayDate}
              renderExam={(exam) => <ExamCard key={exam.id} exam={exam} todayDate={todayDate} />}
            />
          ) : null}

          {view === 'list' && next ? (
            <View style={styles.section}>
              <Text variant="overline" color="textMuted">
                {t('exams.nextUp')}
              </Text>
              <ExamCard exam={next} todayDate={todayDate} highlight />
            </View>
          ) : null}

          {view === 'list' && later.length > 0 ? (
            <View style={styles.section}>
              <Text variant="overline" color="textMuted">
                {t('exams.upcoming')}
              </Text>
              {later.map((exam) => (
                <ExamCard key={exam.id} exam={exam} todayDate={todayDate} />
              ))}
            </View>
          ) : null}

          {addButton}

          {view === 'list' && past.length > 0 ? (
            <View style={styles.section}>
              <Text variant="overline" color="textMuted">
                {t('exams.past')}
              </Text>
              {past.map((exam) => (
                <ExamCard key={exam.id} exam={exam} todayDate={todayDate} />
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function ExamCard({
  exam,
  todayDate,
  highlight = false,
}: {
  exam: Exam;
  todayDate: string;
  highlight?: boolean;
}) {
  const { t } = useTranslation();
  const text = useExamText();
  const subject = text.subjectName(exam.subject);
  const countdown = text.countdown(daysUntil(exam, todayDate));

  return (
    <Card
      raised={highlight}
      onPress={() => router.push({ pathname: '/exams/[id]', params: { id: exam.id } })}
      accessibilityLabel={t('exams.cardLabel', { subject, date: text.longDate(exam), countdown })}
    >
      <Text variant={highlight ? 'title' : 'heading'} accessibilityRole="text">
        {subject}
      </Text>
      {exam.topic ? <Text color="textMuted">{exam.topic}</Text> : null}
      <Text variant="label" color="primary">
        {t('exams.dateAndCountdown', { date: text.date(exam), countdown })}
      </Text>
    </Card>
  );
}

const useStyles = makeStyles((theme) => ({
  section: { gap: theme.space[3] },
  views: { flexDirection: 'row', gap: theme.space[2] },
}));
