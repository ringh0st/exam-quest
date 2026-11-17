import { useEffect } from 'react';
import { create } from 'zustand';

import { onSessionChange, type SessionUser } from '../../services/auth';

export type SessionState =
  { status: 'loading' } | { status: 'signedOut' } | { status: 'signedIn'; user: SessionUser };

/** The signed-in student, kept in sync with the auth service. Not persisted: Supabase keeps it. */
export const useSession = create<SessionState>()(() => ({ status: 'loading' }));

export function setSessionUser(user: SessionUser | null): void {
  useSession.setState(user ? { status: 'signedIn', user } : { status: 'signedOut' }, true);
}

/** Mount once at the root: follows sign-in, sign-out and token refresh. */
export function useSessionSync(): void {
  useEffect(() => onSessionChange(setSessionUser), []);
}
