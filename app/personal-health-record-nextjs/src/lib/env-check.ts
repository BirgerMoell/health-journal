// Check if Supabase environment variables are available
export function checkSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase Environment Check:', {
    NEXT_PUBLIC_SUPABASE_URL_EXISTS: typeof url !== 'undefined',
    NEXT_PUBLIC_SUPABASE_URL_LENGTH: url?.length || 0,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_EXISTS: typeof key !== 'undefined',
    NEXT_PUBLIC_SUPABASE_ANON_KEY_LENGTH: key?.length || 0,
  });
  
  return !!url && !!key;
} 