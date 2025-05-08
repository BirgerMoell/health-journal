'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    // If auth state is loaded and user is not authenticated, redirect to login
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('ProtectedRoute: Not authenticated, redirecting to login');
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="ml-3">Verifying authentication...</p>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
} 