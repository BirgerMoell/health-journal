import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { signOut as authSignOut } from '../services/auth';

export interface HealthProfile {
  age?: string;
  gender?: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  lifestyle?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  healthProfile: HealthProfile;
  updateHealthProfile: (profile: HealthProfile) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    age: '',
    gender: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    lifestyle: ''
  });

  useEffect(() => {
    // Initial session check
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await authSignOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to update health profile
  const updateHealthProfile = (profile: HealthProfile) => {
    setHealthProfile(profile);
    
    // In a production app, you would save this to a database
    // For now we're just keeping it in memory
    try {
      // Store in AsyncStorage or user's database record in a real app
      if (user) {
        // For React Native, you would use AsyncStorage or SecureStore
        // This is just a placeholder - the data will be lost on app restart
        console.log('Health profile updated:', profile);
      }
    } catch (error) {
      console.error('Error saving health profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signOut, 
      healthProfile,
      updateHealthProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};