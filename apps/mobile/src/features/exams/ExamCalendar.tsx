import { MonthCalendar, Text, type CalendarDay } from '@exam-quest/ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { getCountryPack } from '../../countries';
import { useSettings } from '../settings/store';
import { addMonths, monthGrid, monthOf, weekdayOrder } from './calendar';
import type { IsoDate } from './dates';
import { formatMonth, weekdayNames } from './format';
import type { Exam } from './model';
import { useExamText } from './useExamText';

export interface ExamCalendarProps {
  exams: readonly Exam[];
  todayDate: IsoDate;
  /** Renders the exams of the selected day under the calendar. */
  renderExam: (exam: Exam) => ReactNode;
}

export function ExamCalendar({ exams, todayDate, renderExam }: ExamCalendarProps) {
  const { t, i18n } = useTranslation();
  const text = useExamText();
  const country = useSettings((state) => state.country);
  const { weekStartsOn } = getCountryPack(country);
  const [month, setMonth] = useState(() => monthOf(todayDate));
  const [selected, setSelected] = useState<IsoDate>(todayDate);

  const examsOn = (date: IsoDate) => exams.filter((exam) => exam.date === date);
  const names = weekdayNames(i18n.language);

  const weeks: (CalendarDay | null)[][] = monthGrid(month, weekStartsOn).map((week) =>
    week.map((date) => {
      if (!date) return null;
      const dayExams = examsOn(date);
      const longDate = text.longDate({ date });
      return {
        key: date,
        label: String(Number(date.slice(8))),
        accessibilityLabel:
          dayExams.length > 0
            ? t('exams.calendar.dayWithExams', {
                date: longDate,
                subjects: dayExams.map((exam) => text.subjectName(exam.subject)).join(', '),
              })
            : longDate,
        marked: dayExams.length > 0,
        selected: date === selected,
        today: date === todayDate,
      };
    }),
  );

  const selectedExams = examsOn(selected);

  return (
    <>
      <MonthCalendar
        title={formatMonth(month.year, month.month, i18n.language)}
        weekdayLabels={weekdayOrder(weekStartsOn).map((index) => names[index] ?? '')}
        weeks={weeks}
        onSelectDay={setSelected}
        previousLabel={t('exams.calendar.previous')}
        nextLabel={t('exams.calendar.next')}
        onPrevious={() => setMonth((current) => addMonths(current, -1))}
        onNext={() => setMonth((current) => addMonths(current, 1))}
      />
      {selectedExams.length > 0 ? (
        selectedExams.map((exam) => renderExam(exam))
      ) : (
        <Text color="textMuted">
          {t('exams.calendar.noExamsOnDay', { date: text.longDate({ date: selected }) })}
        </Text>
      )}
    </>
  );
}
