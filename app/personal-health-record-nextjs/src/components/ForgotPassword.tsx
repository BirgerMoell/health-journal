'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setMessage({
        text: 'Password reset instructions sent! Please check your email.',
        type: 'success'
      });
      
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setMessage({
        text: err.message || 'An error occurred while attempting to reset your password.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">
        Reset Your Password
      </h2>
      
      {message && (
        <div 
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border-l-4 border-green-500' 
              : 'bg-red-100 text-red-700 border-l-4 border-red-500'
          }`}
        >
          <p>{message.text}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter your email address"
          />
          <p className="mt-1 text-sm text-gray-500">
            We'll send password reset instructions to this email.
          </p>
        </div>
        
        <motion.button
          type="submit"
          disabled={loading || !email}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || !email ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {loading ? 'Sending Instructions...' : 'Reset Password'}
        </motion.button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <Link 
          href="/login" 
          className="text-teal-600 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
} 