'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SupabaseDebug() {
  const [status, setStatus] = useState('Checking...');
  
  useEffect(() => {
    async function checkSupabase() {
      try {
        // Check if Supabase URL and key exist
        const configured = isSupabaseConfigured();
        
        // Try a simple query to test connection
        const { data, error } = await supabase.from('journal_entries').select('count').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setStatus(`Error: ${error.message}`);
          return;
        }
        
        setStatus(`Connected successfully! Config: ${configured ? 'Valid' : 'Invalid'}`);
      } catch (err) {
        console.error('Supabase debug error:', err);
        setStatus(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    checkSupabase();
  }, []);
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-medium mb-2">Supabase Connection Status:</h3>
      <div className={`text-sm ${status.includes('Error') || status.includes('Exception') ? 'text-red-600' : 'text-green-600'}`}>
        {status}
      </div>
      <div className="text-xs mt-2 text-gray-500">
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}<br/>
        Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `✓ Set (length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})` : '✗ Missing'}
      </div>
    </div>
  );
} 