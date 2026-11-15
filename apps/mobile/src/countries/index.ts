import { fi } from './fi';
import type { CountryPack } from './types';

export const countryPacks = { FI: fi } as const satisfies Record<string, CountryPack>;

export type CountryCode = keyof typeof countryPacks;

export const defaultCountry: CountryCode = 'FI';

export function getCountryPack(code: CountryCode): CountryPack {
  return countryPacks[code];
}

export type { CountryPack, HelpResource } from './types';
