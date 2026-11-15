import { z } from 'zod';

/**
 * Where the app's backend lives. Only public values belong here: the project URL and the
 * publishable key, which is safe in the app bundle because row-level security protects the data.
 * Secret keys stay server-side and never come through EXPO_PUBLIC_ variables.
 */
const backendSchema = z.object({
  supabaseUrl: z.url({ protocol: /^https$/ }),
  supabasePublishableKey: z
    .string()
    .regex(/^sb_publishable_/, 'Use the publishable key, never a secret key'),
});

export type BackendConfig = z.infer<typeof backendSchema>;

export function parseBackendConfig(env: {
  url: string | undefined;
  publishableKey: string | undefined;
}): BackendConfig {
  return backendSchema.parse({ supabaseUrl: env.url, supabasePublishableKey: env.publishableKey });
}

/** Read lazily so screens that don't need the backend keep working without it. */
export function backendConfig(): BackendConfig {
  // Expo inlines EXPO_PUBLIC_ variables at build time; they must be read by their full name.
  return parseBackendConfig({
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
