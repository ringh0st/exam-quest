import { isValidCode, isValidEmail, normalizeCode, normalizeEmail } from '../validation';

describe('email', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Aino.Student@Example.FI ')).toBe('aino.student@example.fi');
  });

  it('accepts real addresses and rejects typos', () => {
    expect(isValidEmail('aino@example.fi')).toBe(true);
    expect(isValidEmail(' aino@example.fi ')).toBe(true);
    expect(isValidEmail('aino@')).toBe(false);
    expect(isValidEmail('aino example.fi')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('code', () => {
  it('keeps only digits, so pasted codes with spaces work', () => {
    expect(normalizeCode('123 456')).toBe('123456');
    expect(isValidCode('123 456')).toBe(true);
  });

  it('needs exactly six digits', () => {
    expect(isValidCode('12345')).toBe(false);
    expect(isValidCode('1234567')).toBe(false);
    expect(isValidCode('abcdef')).toBe(false);
  });
});
