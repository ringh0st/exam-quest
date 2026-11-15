import { addMonths, monthGrid, monthOf, weekdayOrder } from '../calendar';

describe('calendar', () => {
  it('lays out November 2026 with Monday-first weeks', () => {
    const weeks = monthGrid({ year: 2026, month: 11 }, 1);
    // 1 Nov 2026 is a Sunday: six empty cells first.
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(weeks[1]?.[0]).toBe('2026-11-02');
    expect(weeks.at(-1)).toEqual(['2026-11-30', null, null, null, null, null, null]);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  it('supports Sunday-first weeks', () => {
    expect(monthGrid({ year: 2026, month: 11 }, 0)[0]?.[0]).toBe('2026-11-01');
  });

  it('handles leap years', () => {
    expect(monthGrid({ year: 2028, month: 2 }, 1).flat().filter(Boolean)).toHaveLength(29);
  });

  it('moves between months and years', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(monthOf('2026-11-20')).toEqual({ year: 2026, month: 11 });
  });

  it('orders weekdays from the first day of the week', () => {
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });
});
