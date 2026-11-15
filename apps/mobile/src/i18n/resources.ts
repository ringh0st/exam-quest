import en from './locales/en.json';

export const defaultLanguage = 'en';

export const resources = {
  en: { translation: en },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];

export function isSupportedLanguage(code: string | null | undefined): code is SupportedLanguage {
  return code != null && (supportedLanguages as string[]).includes(code);
}
