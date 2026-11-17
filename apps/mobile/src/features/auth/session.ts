import { useEffect } from 'react';
import { create } from 'zustand';

import { onSessionChange, type SessionUser } from '../../services/auth';
import { fetchTermsAcceptedAt } from '../../services/profile';
import { needsConsent } from './consent';

/** Whether the signed-in student still has to confirm their age and accept the terms. */
export type ConsentStatus = 'checking' | 'needed' | 'given' | 'unknown';

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: SessionUser; consent: ConsentStatus };

/** The signed-in student, kept in sync with the auth service. Not persisted: Supabase keeps it. */
export const useSession = create<SessionState>()(() => ({ status: 'loading' }));

export function setSessionUser(
  user: SessionUser | null,
  consent: ConsentStatus = 'checking',
): void {
  useSession.setState(user ? { status: 'signedIn', user, consent } : { status: 'signedOut' }, true);
}

export function setConsent(consent: ConsentStatus): void {
  const state = useSession.getState();
  if (state.status === 'signedIn') useSession.setState({ ...state, consent }, true);
}

/** Look up whether this student has accepted the current terms. Offline leaves it 'unknown'. */
export async function refreshConsent(userId: string): Promise<void> {
  try {
    const acceptedAt = await fetchTermsAcceptedAt(userId);
    const state = useSession.getState();
    if (state.status === 'signedIn' && state.user.id === userId) {
      setConsent(needsConsent(acceptedAt) ? 'needed' : 'given');
    }
  } catch {
    setConsent('unknown');
  }
}

/** Mount once at the root: follows sign-in, sign-out and token refresh. */
export function useSessionSync(): void {
  useEffect(
    () =>
      onSessionChange((user) => {
        const previous = useSession.getState();
        const sameUser = previous.status === 'signedIn' && previous.user.id === user?.id;
        // Token refreshes report the same user again; keep what we already know about consent.
        if (sameUser) return;
        setSessionUser(user);
        if (user) void refreshConsent(user.id);
      }),
    [],
  );
}
