'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SessionVerifier() {
  const [log, setLog] = useState<string[]>([]);
  const [sessionState, setSessionState] = useState('checking');

  useEffect(() => {
    // Function to add a log entry with timestamp
    const addLog = (message: string) => {
      const timestamp = new Date().toISOString().substr(11, 8);
      setLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    };

    async function verifySession() {
      addLog('Starting session verification');
      
      try {
        // Check session status
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          addLog(`Session error: ${error.message}`);
          setSessionState('error');
          return;
        }
        
        if (data && data.session) {
          const expiresAt = new Date(data.session.expires_at! * 1000);
          addLog(`Session found for ${data.session.user.email}`);
          addLog(`Session expires: ${expiresAt.toLocaleTimeString()}`);
          setSessionState('authenticated');
          
          // Test a data access call
          const { data: testData, error: testError } = await supabase.from('journal_entries').select('count').limit(1);
          
          if (testError) {
            addLog(`Database access error: ${testError.message}`);
          } else {
            addLog('Database access successful');
          }
          
        } else {
          addLog('No active session found');
          setSessionState('unauthenticated');
        }
      } catch (err) {
        addLog(`Verification error: ${err instanceof Error ? err.message : String(err)}`);
        setSessionState('error');
      }
    }
    
    verifySession();
    
    // Also listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state changed: ${event}`);
      setSessionState(session ? 'authenticated' : 'unauthenticated');
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      <div className="flex items-center mb-3">
        <h3 className="text-lg font-medium mr-2">Session Verifier</h3>
        <span 
          className={`px-2 py-1 text-xs rounded-full ${
            sessionState === 'authenticated' ? 'bg-green-100 text-green-800' :
            sessionState === 'unauthenticated' ? 'bg-red-100 text-red-800' :
            sessionState === 'error' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}
        >
          {sessionState}
        </span>
      </div>
      
      <div className="bg-gray-100 p-2 rounded text-xs font-mono h-40 overflow-y-auto">
        {log.length > 0 ? (
          log.map((entry, i) => (
            <div key={i} className="mb-1">{entry}</div>
          ))
        ) : (
          <div className="text-gray-500">Initializing...</div>
        )}
      </div>
      
      <div className="mt-3 flex justify-end">
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm mr-2"
        >
          Return to login
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
        >
          Refresh page
        </button>
      </div>
    </div>
  );
} 