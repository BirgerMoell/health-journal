'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

// Define the context type
interface AuthContextType {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathName = usePathname();

  // Check if current path is public
  const isPublicPath = 
    pathName?.startsWith('/login') || 
    pathName?.startsWith('/signup') || 
    pathName?.startsWith('/faq') || 
    pathName?.startsWith('/privacy') ||
    pathName === '/';

  useEffect(() => {
    // Function to get the current session and user
    async function getInitialSession() {
      try {
        console.log('AuthContext: Checking initial session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Session error', error);
          setSession(null);
          setUser(null);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        console.log('AuthContext: Initial session check complete', { 
          hasSession: !!data.session,
          hasUser: !!data.session?.user 
        });
      } catch (e) {
        console.error('AuthContext: Error getting session', e);
      } finally {
        setIsLoading(false);
      }
    }

    // Get initial session
    getInitialSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', {
          event,
          hasSession: !!newSession,
          userId: newSession?.user?.id
        });
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle redirects based on authentication state
  useEffect(() => {
    if (isLoading) {
      console.log('Auth: Still loading, not redirecting');
      return;
    }
    
    console.log('Auth state check:', { 
      hasSession: !!session,
      isPublicPath,
      currentPath: pathName,
      user: user?.id
    });

    const handleRedirect = async () => {
      if (!session && !isPublicPath && pathName) {
        console.log('Auth: No session, redirecting to login');
        router.replace('/login');
      } else if (session && pathName === '/login') {
        console.log('Auth: Session exists, redirecting from login to home');

        // Ensure the session state is properly updated before navigating
        setUser(session.user);

        setTimeout(() => {
          router.replace('/home'); // Replace prevents back button issues
          router.refresh(); // Refresh to update state properly
        }, 100);
      }
    };

    handleRedirect();
  }, [session, isLoading, isPublicPath, router, pathName]);

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error signing out', error);
      } else {
        setUser(null);
        setSession(null);
        router.replace('/login');
      }
    } catch (e) {
      console.error('AuthContext: Exception during sign out', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
