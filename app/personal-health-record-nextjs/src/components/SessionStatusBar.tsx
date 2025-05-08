'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function SessionStatusBar() {
  const { session, user, isLoading } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const pathname = usePathname();
  
  // Don't show on login page
  if (pathname === '/login') return null;
  
  return (
    <div 
      className="bg-gray-100 border-b border-gray-200 py-1 px-4 text-xs text-gray-600 flex justify-between items-center"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div>
        Session: {isLoading ? 'Loading' : session ? '✓' : '✗'} |
        Path: {pathname} |
        User: {user?.email || 'None'}
      </div>
      
      {showDetails && session && (
        <div className="absolute top-6 right-4 bg-white shadow-md p-2 rounded z-50 text-xs">
          <pre className="whitespace-pre-wrap max-w-md max-h-40 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
      
      <button 
        className="text-xs underline"
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
    </div>
  );
} 