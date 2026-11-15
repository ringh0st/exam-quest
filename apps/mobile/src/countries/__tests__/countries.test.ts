import { countryPacks } from '..';
import { countryPackSchema } from '../types';

describe.each(Object.entries(countryPacks))('%s country pack', (code, pack) => {
  it('matches the schema', () => {
    expect(() => countryPackSchema.parse(pack)).not.toThrow();
  });

  it('is registered under its own code', () => {
    expect(pack.code).toBe(code);
  });

  it('has a passing grade inside the grade range', () => {
    const { min, max, pass } = pack.grades.course;
    expect(pass).toBeGreaterThanOrEqual(min);
    expect(pass).toBeLessThanOrEqual(max);
  });

  it('includes an emergency number', () => {
    expect(pack.helpResources.some((resource) => resource.kind === 'emergency')).toBe(true);
  });
});
