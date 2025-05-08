'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageTransition from './PageTransition';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthForm({ type = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRedirect, setSuccessRedirect] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (session) {
      console.log("Already authenticated, redirecting to home");
      router.push('/home');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Starting login attempt...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true
        }
      });

      if (error) throw error;
      
      console.log('Login response:', {
        success: true,
        user: data.user?.id,
        session: !!data.session
      });

      // Force navigation after successful login
      router.replace('/home');
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {successRedirect && <PageTransition to="/dashboard" message="Login successful! Redirecting..." />}
      
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-sm text-teal-600 hover:underline"
              onClick={(e) => {
                console.log('Forgot password clicked');
                // Try forcing navigation programmatically as a backup
                if (typeof window !== 'undefined') {
                  window.location.href = '/forgot-password';
                }
              }}
            >
              Forgot password?
            </Link>
          </div>
          
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading 
              ? 'Loading...' 
              : isSignUp 
                ? 'Create Account' 
                : 'Sign In'
            }
          </motion.button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-teal-600 hover:underline"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : 'Need an account? Sign Up'
            }
          </button>
        </div>
      </div>
    </>
  );
} 