'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwordValid, setPasswordValid] = useState(false);
  const router = useRouter();

  // Validate password as user types
  useEffect(() => {
    // Password should be at least 8 characters with at least one number and one special character
    const isValid = password.length >= 8 && 
                    /[0-9]/.test(password) && 
                    /[!@#$%^&*]/.test(password);
    setPasswordValid(isValid);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Additional validation
    if (password !== confirmPassword) {
      setMessage({
        text: 'Passwords do not match',
        type: 'error'
      });
      return;
    }
    
    if (!passwordValid) {
      setMessage({
        text: 'Password is not strong enough',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password
      });

      if (error) throw error;
      
      setMessage({
        text: 'Password has been reset successfully!',
        type: 'success'
      });
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error updating password:', err);
      setMessage({
        text: err.message || 'An error occurred while updating your password.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">
        Create New Password
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              password ? (passwordValid ? 'border-green-500 focus:ring-green-500' : 'border-red-300 focus:ring-red-500') : 'border-gray-300 focus:ring-teal-500'
            }`}
          />
          <div className="mt-1 text-sm">
            <p className={password && !/[0-9]/.test(password) ? 'text-red-500' : 'text-green-600'}>
              • Must contain at least 1 number
            </p>
            <p className={password && !/[!@#$%^&*]/.test(password) ? 'text-red-500' : 'text-green-600'}>
              • Must contain at least 1 special character (!@#$%^&*)
            </p>
            <p className={password && password.length < 8 ? 'text-red-500' : 'text-green-600'}>
              • Must be at least 8 characters
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              confirmPassword 
                ? (confirmPassword === password ? 'border-green-500 focus:ring-green-500' : 'border-red-300 focus:ring-red-500') 
                : 'border-gray-300 focus:ring-teal-500'
            }`}
          />
          {confirmPassword && confirmPassword !== password && (
            <p className="mt-1 text-sm text-red-500">
              Passwords do not match
            </p>
          )}
        </div>
        
        <motion.button
          type="submit"
          disabled={loading || !passwordValid || password !== confirmPassword}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || !passwordValid || password !== confirmPassword 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {loading ? 'Updating Password...' : 'Reset Password'}
        </motion.button>
      </form>
    </div>
  );
} 