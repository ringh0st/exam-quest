import { z } from 'zod';

import { appConfig } from '../../config/appConfig';

const emailSchema = z.email();

/** Emails are compared case-insensitively; trim stray spaces from copy and paste. */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidEmail(input: string): boolean {
  return emailSchema.safeParse(normalizeEmail(input)).success;
}

/** Codes are often pasted with spaces ("123 456"); keep only the digits. */
export function normalizeCode(input: string): string {
  return input.replace(/\D/g, '');
}

export function isValidCode(input: string): boolean {
  return normalizeCode(input).length === appConfig.auth.codeLength;
}
