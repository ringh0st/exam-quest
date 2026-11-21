import i18n, { pickLanguage } from '..';
import en from '../locales/en.json';

describe('pickLanguage', () => {
  it('uses the first supported device language', () => {
    expect(pickLanguage(['xx', 'en'])).toBe('en');
  });

  it('falls back to English when no device language is supported', () => {
    expect(pickLanguage(['xx', null])).toBe('en');
  });
});

describe('i18n', () => {
  it('resolves keys from the English catalogue', () => {
    expect(i18n.t('quests.title')).toBe(en.quests.title);
  });
});

describe('app name', () => {
  it('never uses an old working name in user-facing text', () => {
    const text = JSON.stringify(jest.requireActual('../locales/en.json'));
    for (const oldName of ['Mentora', 'Exam Quest', 'Questnote']) {
      expect(text).not.toContain(oldName);
    }
  });
});
