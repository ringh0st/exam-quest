import { formatExamDate, formatExamDateLong } from '../format';

it('formats exam dates for the student language', () => {
  expect(formatExamDate('2026-11-20', 'en')).toBe('Fri, Nov 20');
  expect(formatExamDateLong('2026-11-20', 'en')).toBe('Friday, November 20, 2026');
});
