'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PageTransition({ 
  to, 
  timeout = 2000, 
  message = 'Redirecting...'
}: { 
  to: string; 
  timeout?: number;
  message?: string;
}) {
  const router = useRouter();
  const [count, setCount] = useState(3);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => Math.max(0, prev - 1));
    }, 1000);
    
    // Add a guaranteed fallback that will trigger no matter what
    const forcedRedirect = setTimeout(() => {
      console.log('Forced navigation fallback');
      window.location.href = to;
    }, 4000);
    
    // Try normal router navigation after countdown
    setTimeout(() => {
      clearInterval(timer);
      console.log(`Navigating to ${to} using Next.js router`);
      
      try {
        router.push(to);
        
        // Add a secondary fallback with window.location
        setTimeout(() => {
          console.log('Secondary fallback navigation');
          window.location.href = to;
        }, 1000);
      } catch (e) {
        console.error('Router navigation failed:', e);
        window.location.href = to;
      }
    }, timeout);
    
    return () => {
      clearInterval(timer);
      clearTimeout(forcedRedirect);
    };
  }, [router, timeout, to]);
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
        </div>
        <p className="text-lg font-medium text-center text-teal-700">
          {message}
        </p>
        {count > 0 && (
          <p className="text-sm text-center text-gray-500 mt-2">
            Redirecting in {count}...
          </p>
        )}
      </div>
    </div>
  );
} 