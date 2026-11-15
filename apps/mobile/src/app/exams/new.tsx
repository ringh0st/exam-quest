import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  Button,
  Chip,
  ErrorText,
  Screen,
  Text,
  TextField,
  makeStyles,
  useTheme,
} from '@exam-quest/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Platform, View } from 'react-native';

import { getCountryPack } from '../../countries';
import { fromIsoDate, toIsoDate, today, type IsoDate } from '../../features/exams/dates';
import { dateShortcuts, type ExamSubject } from '../../features/exams/model';
import { useExams } from '../../features/exams/store';
import type { SubjectId } from '../../features/exams/subjects';
import { useExamText } from '../../features/exams/useExamText';
import { useSettings } from '../../features/settings/store';

type SubjectChoice = SubjectId | 'other';
type DateChoice = 'tomorrow' | 'nextWeek' | 'pick';

/** Add an exam in three taps: subject, date, done. Topic is optional. */
export default function NewExamScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const text = useExamText();
  const country = useSettings((state) => state.country);
  const addExam = useExams((state) => state.addExam);

  const todayDate = today();
  const shortcuts = dateShortcuts(todayDate);
  const [subjectChoice, setSubjectChoice] = useState<SubjectChoice | null>(null);
  const [customName, setCustomName] = useState('');
  const [dateChoice, setDateChoice] = useState<DateChoice | null>(null);
  const [pickedDate, setPickedDate] = useState<IsoDate>(shortcuts.tomorrow);
  const [showPicker, setShowPicker] = useState(false);
  const [topic, setTopic] = useState('');
  const [triedToSave, setTriedToSave] = useState(false);

  const subject: ExamSubject | null =
    subjectChoice === null
      ? null
      : subjectChoice === 'other'
        ? customName.trim()
          ? { kind: 'custom', name: customName.trim() }
          : null
        : { kind: 'known', id: subjectChoice };

  const date: IsoDate | null =
    dateChoice === null ? null : dateChoice === 'pick' ? pickedDate : shortcuts[dateChoice];

  const chooseDate = (choice: DateChoice) => {
    setDateChoice(choice);
    setShowPicker(choice === 'pick');
  };

  const onPickerChange = (event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && value) setPickedDate(toIsoDate(value));
  };

  const save = () => {
    setTriedToSave(true);
    if (!subject || !date) return;
    const trimmedTopic = topic.trim();
    const exam = addExam({ subject, date, ...(trimmedTopic ? { topic: trimmedTopic } : {}) });
    AccessibilityInfo.announceForAccessibility(
      t('exams.new.saved', { subject: text.subjectName(exam.subject), date: text.longDate(exam) }),
    );
    router.back();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text variant="title">{t('exams.new.title')}</Text>
        <Button label={t('exams.new.cancel')} variant="quiet" onPress={() => router.back()} />
      </View>

      <View style={styles.section}>
        <Text variant="heading">{t('exams.new.subject')}</Text>
        <View style={styles.chips}>
          {getCountryPack(country).subjects.map((id) => (
            <Chip
              key={id}
              label={t(`subjects.${id}`)}
              selected={subjectChoice === id}
              onPress={() => setSubjectChoice(id)}
            />
          ))}
          <Chip
            label={t('exams.new.other')}
            selected={subjectChoice === 'other'}
            onPress={() => setSubjectChoice('other')}
          />
        </View>
        {triedToSave && subjectChoice === null ? (
          <ErrorText>{t('exams.new.subjectError')}</ErrorText>
        ) : null}
        {subjectChoice === 'other' ? (
          <TextField
            label={t('exams.new.customSubject')}
            value={customName}
            onChangeText={setCustomName}
            maxLength={60}
            autoFocus
            {...(triedToSave && !customName.trim()
              ? { error: t('exams.new.customSubjectError') }
              : {})}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text variant="heading">{t('exams.new.date')}</Text>
        <View style={styles.chips}>
          <Chip
            label={t('exams.new.tomorrow')}
            selected={dateChoice === 'tomorrow'}
            onPress={() => chooseDate('tomorrow')}
          />
          <Chip
            label={t('exams.new.nextWeek')}
            selected={dateChoice === 'nextWeek'}
            onPress={() => chooseDate('nextWeek')}
          />
          <Chip
            label={t('exams.new.pickDate')}
            selected={dateChoice === 'pick'}
            onPress={() => chooseDate('pick')}
          />
        </View>
        {triedToSave && !date ? <ErrorText>{t('exams.new.dateError')}</ErrorText> : null}
        {showPicker ? (
          <DateTimePicker
            value={fromIsoDate(pickedDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={fromIsoDate(todayDate)}
            onChange={onPickerChange}
            accentColor={theme.colors.primary}
          />
        ) : null}
        {date ? (
          <Text color="textMuted" accessibilityRole="text">
            {t('exams.new.chosenDate', { date: text.longDate({ date }) })}
          </Text>
        ) : null}
      </View>

      <TextField
        label={t('exams.new.topic')}
        hint={t('exams.new.topicHint')}
        value={topic}
        onChangeText={setTopic}
        maxLength={120}
      />

      <Button
        label={t('exams.new.save')}
        accessibilityHint={t('exams.new.saveHint')}
        variant="accent"
        fullWidth
        onPress={save}
      />
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  section: { gap: theme.space[3] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
}));
