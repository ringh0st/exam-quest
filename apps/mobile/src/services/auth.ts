import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import { normalizeCode, normalizeEmail } from '../features/auth/validation';
import { supabase } from './supabase';

export interface SessionUser {
  id: string;
  email: string | null;
}

export type AuthFailure = 'rateLimited' | 'invalidCode' | 'network' | 'unknown';
export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure };

function toFailure(error: unknown): AuthFailure {
  if (isAuthRetryableFetchError(error)) return 'network';
  if (isAuthApiError(error)) {
    if (error.status === 429 || error.code?.startsWith('over_')) return 'rateLimited';
    // Supabase answers a wrong code and an expired code the same way.
    if (error.code === 'otp_expired') return 'invalidCode';
  }
  return 'unknown';
}

/** Email a one-time sign-in code. Creates the account on first sign-in. */
export async function sendSignInCode(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase().auth.signInWithOtp({
      email: normalizeEmail(email),
      options: { shouldCreateUser: true },
    });
    return error ? { ok: false, reason: toFailure(error) } : { ok: true };
  } catch (error) {
    return { ok: false, reason: toFailure(error) };
  }
}

export async function verifySignInCode(email: string, code: string): Promise<AuthResult> {
  try {
    const { error } = await supabase().auth.verifyOtp({
      email: normalizeEmail(email),
      token: normalizeCode(code),
      type: 'email',
    });
    return error ? { ok: false, reason: toFailure(error) } : { ok: true };
  } catch (error) {
    return { ok: false, reason: toFailure(error) };
  }
}

export async function signOut(): Promise<void> {
  await supabase().auth.signOut();
}

/** Calls back with the current user now and after every change. Returns an unsubscribe. */
export function onSessionChange(callback: (user: SessionUser | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase().auth.onAuthStateChange((_event, session) => {
    callback(session ? { id: session.user.id, email: session.user.email ?? null } : null);
  });
  return () => subscription.unsubscribe();
}
