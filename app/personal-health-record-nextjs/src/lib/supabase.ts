import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL_EXISTS: !!supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_EXISTS: !!supabaseAnonKey,
  });
  
  if (typeof window !== 'undefined') {
    // Only show this error in the browser, not during server-side rendering
    alert('Supabase configuration error. Check the console for details.');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Add a method to check if Supabase is properly configured
export function isSupabaseConfigured() {
  return !!supabaseUrl && !!supabaseAnonKey;
} 