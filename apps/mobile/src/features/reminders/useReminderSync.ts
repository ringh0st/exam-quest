import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { appConfig } from '../../config/appConfig';
import { getCountryPack } from '../../countries';
import {
  cancelScheduledNotifications,
  replaceScheduledNotifications,
} from '../../services/notifications';
import { today } from '../exams/dates';
import { useExams } from '../exams/store';
import { subjectName } from '../exams/useExamText';
import { useSettings } from '../settings/store';
import { planReminders } from './plan';

function currentTime(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/** Keeps scheduled reminders in step with the student's exams and settings. */
export function useReminderSync(): void {
  const { t } = useTranslation();
  const exams = useExams((state) => state.exams);
  const enabled = useSettings((state) => state.remindersEnabled);
  const studyTime = useSettings((state) => state.studyTime);
  const country = useSettings((state) => state.country);

  useEffect(() => {
    if (!enabled) {
      void cancelScheduledNotifications();
      return;
    }
    const now = new Date();
    const { notifications } = appConfig;
    const plan = planReminders(exams, {
      today: today(now),
      now: currentTime(now),
      studyTime,
      examMorningTime: notifications.examMorningTime,
      daysBefore: notifications.daysBefore,
      quietHours: notifications.quietHours,
      schoolHours: getCountryPack(country).schoolHours,
      maxPerDay: notifications.maxPerDay,
      horizonDays: notifications.horizonDays,
    });
    const subjectsOf = (ids: string[]) =>
      ids
        .flatMap((id) => {
          const exam = exams.find((candidate) => candidate.id === id);
          return exam ? [subjectName(exam.subject, t)] : [];
        })
        .join(', ');

    void replaceScheduledNotifications(
      plan.map((reminder) => ({
        date: reminder.date,
        time: reminder.time,
        title: t(`reminders.title.${reminder.kind}`, { subjects: subjectsOf(reminder.examIds) }),
        body: t(`reminders.body.${reminder.kind}`),
      })),
    );
  }, [exams, enabled, studyTime, country, t]);
}
