import { addDays, daysBetween, fromIsoDate, isIsoDate, toIsoDate, today } from '../dates';

describe('dates', () => {
  it('validates real calendar dates only', () => {
    expect(isIsoDate('2026-11-20')).toBe(true);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2027-02-29')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('20.11.2026')).toBe(false);
  });

  it('round-trips local dates', () => {
    expect(toIsoDate(fromIsoDate('2026-11-20'))).toBe('2026-11-20');
    expect(today(new Date(2026, 10, 15, 23, 59))).toBe('2026-11-15');
  });

  it('adds days across months and years', () => {
    expect(addDays('2026-11-28', 7)).toBe('2026-12-05');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts calendar days across daylight saving changes', () => {
    // Finland moves clocks back on 25 Oct 2026 and forward on 28 Mar 2027.
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(daysBetween('2027-03-27', '2027-03-29')).toBe(2);
    expect(daysBetween('2026-11-20', '2026-11-15')).toBe(-5);
  });

  it('rejects invalid dates', () => {
    expect(() => fromIsoDate('2027-02-29')).toThrow();
  });
});
