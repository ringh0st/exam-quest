import { formatExamDate, formatExamDateLong, formatMonth, weekdayNames } from '../format';

it('formats exam dates for the student language', () => {
  expect(formatExamDate('2026-11-20', 'en')).toBe('Fri, Nov 20');
  expect(formatExamDateLong('2026-11-20', 'en')).toBe('Friday, November 20, 2026');
});

it('formats month titles and weekday names', () => {
  expect(formatMonth(2026, 11, 'en')).toBe('November 2026');
  expect(weekdayNames('en')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
});
