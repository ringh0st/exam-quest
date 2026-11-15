import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { formatExamDate, formatExamDateLong } from './format';
import type { Exam, ExamSubject } from './model';

/** The display name of an exam's subject. */
export function subjectName(subject: ExamSubject, t: TFunction): string {
  return subject.kind === 'custom' ? subject.name : t(`subjects.${subject.id}`);
}

/** Display text for exams, shared by lists, details and screen-reader labels. */
export function useExamText() {
  const { t, i18n } = useTranslation();

  const countdown = (days: number) => {
    if (days < 0) return t('exams.countdown.past');
    if (days === 0) return t('exams.countdown.today');
    if (days === 1) return t('exams.countdown.tomorrow');
    return t('exams.countdown.inDays', { count: days });
  };

  const date = (exam: Pick<Exam, 'date'>) => formatExamDate(exam.date, i18n.language);
  const longDate = (exam: Pick<Exam, 'date'>) => formatExamDateLong(exam.date, i18n.language);

  return {
    subjectName: (subject: ExamSubject) => subjectName(subject, t),
    countdown,
    date,
    longDate,
  };
}
