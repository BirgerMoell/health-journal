'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Routes that don't require authentication
const publicPaths = ['/login', '/forgot-password', '/reset-password', '/signup'];

export default function ClientNavigationGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '';
  
  // Check if the current path is public
  const isPublicPath = publicPaths.includes(pathname || '');
  
  useEffect(() => {
    // Check auth state right away
    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      // Redirect if needed based on new auth state
      handleAuthChange(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);
  
  // Function to check authentication
  async function checkAuth() {
    try {
      const { data } = await supabase.auth.getSession();
      console.log('Navigation guard session check:', { 
        path: pathname,
        hasSession: !!data.session 
      });
      
      setIsAuthenticated(!!data.session);
      setIsLoading(false);
      
      // Handle routing based on auth state
      handleAuthChange(!!data.session);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoading(false);
    }
  }
  
  // Function to handle auth state changes and redirect if needed
  function handleAuthChange(authenticated: boolean) {
    if (!authenticated && !isPublicPath) {
      console.log('Not authenticated, redirecting to login');
      // Add a small delay to avoid navigation conflicts
      setTimeout(() => {
        router.push('/login?from=' + encodeURIComponent(pathname));
      }, 100);
    } else if (authenticated && isPublicPath) {
      console.log('Already authenticated, redirecting to home');
      // Add a small delay to avoid navigation conflicts
      setTimeout(() => {
        router.push('/home');
      }, 100);
    }
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="ml-3">Checking authentication...</p>
      </div>
    );
  }
  
  // When loading is complete, render children
  return <>{children}</>;
} 