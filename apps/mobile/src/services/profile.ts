import { z } from 'zod';

import { supabase } from './supabase';

const consentRowSchema = z.object({ terms_accepted_at: z.string().nullable() });

/** When the signed-in student accepted the terms, or null if never. Throws if unreachable. */
export async function fetchTermsAcceptedAt(userId: string): Promise<string | null> {
  const { data, error } = await supabase()
    .from('profiles')
    .select('terms_accepted_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return consentRowSchema.parse(data).terms_accepted_at;
}

/** Record that the student confirmed the age requirement and accepted the terms. */
export async function acceptTerms(userId: string): Promise<boolean> {
  const { error } = await supabase()
    .from('profiles')
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq('id', userId);
  return !error;
}
