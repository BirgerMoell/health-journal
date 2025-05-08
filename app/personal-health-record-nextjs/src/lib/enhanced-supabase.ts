import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a custom Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Ensure session is persisted in localStorage
    autoRefreshToken: true, // Automatically refresh the token
    detectSessionInUrl: false, // Don't detect session in URL (avoid conflicts with Next.js)
  },
  global: {
    // Add custom fetch handler with enhanced error reporting
    fetch: (...args) => {
      return fetch(...args).then(async (res) => {
        if (!res.ok) {
          console.error(`Supabase fetch error: ${res.status} ${res.statusText}`);
          try {
            const errorData = await res.clone().json();
            console.error('Error details:', errorData);
          } catch (e) {
            // Couldn't parse error as JSON
          }
        }
        return res;
      });
    },
  },
});

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

// Export direct auth methods for convenience
export const auth = supabase.auth; 