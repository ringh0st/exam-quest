import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { backendConfig } from '../config/backend';

let client: SupabaseClient | undefined;

/** The app's single Supabase client, created on first use. */
export function supabase(): SupabaseClient {
  if (!client) {
    const { supabaseUrl, supabasePublishableKey } = backendConfig();
    const created = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    // Refresh the session only while the app is in the foreground.
    AppState.addEventListener('change', (state) => {
      if (state === 'active') void created.auth.startAutoRefresh();
      else void created.auth.stopAutoRefresh();
    });
    client = created;
  }
  return client;
}
