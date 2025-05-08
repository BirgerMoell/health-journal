'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SessionDebug() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        setSession(data.session);
        console.log('Session debug:', { 
          hasSession: !!data.session,
          sessionDetails: data.session 
        });
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
    
    // Also set up listener for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      setSession(session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Checking session...</div>;

  return (
    <div className="bg-gray-100 p-3 rounded-lg text-sm mb-4">
      <h3 className="font-medium">Session Status:</h3>
      <div>{session ? '✅ Authenticated' : '❌ Not authenticated'}</div>
      {session && (
        <div className="mt-2">
          <div>User: {session.user?.email}</div>
          <div>Expires: {new Date(session.expires_at * 1000).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
} 