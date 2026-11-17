import { appConfig } from '../../config/appConfig';

/** Whether a student who accepted the terms at `acceptedAt` (ISO time, or never) must accept again. */
export function needsConsent(
  acceptedAt: string | null,
  termsUpdatedAt: string = appConfig.legal.termsUpdatedAt,
): boolean {
  if (!acceptedAt) return true;
  const accepted = Date.parse(acceptedAt);
  if (Number.isNaN(accepted)) return true;
  return accepted < Date.parse(`${termsUpdatedAt}T00:00:00Z`);
}
