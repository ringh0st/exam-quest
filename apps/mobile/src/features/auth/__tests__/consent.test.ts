import { needsConsent } from '../consent';

describe('needsConsent', () => {
  it('asks students who never accepted', () => {
    expect(needsConsent(null, '2026-11-17')).toBe(true);
  });

  it('does not ask again after accepting the current terms', () => {
    expect(needsConsent('2026-11-17T08:00:00Z', '2026-11-17')).toBe(false);
    expect(needsConsent('2027-01-01T00:00:00Z', '2026-11-17')).toBe(false);
  });

  it('asks again when the terms changed after they accepted', () => {
    expect(needsConsent('2026-11-16T23:59:59Z', '2026-11-17')).toBe(true);
  });

  it('asks when the stored time is unreadable', () => {
    expect(needsConsent('not a date', '2026-11-17')).toBe(true);
  });
});
