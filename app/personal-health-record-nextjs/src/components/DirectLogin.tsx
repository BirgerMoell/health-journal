'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DirectLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Direct login attempt with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true
        }
      });

      if (error) throw error;
      
      console.log('Login successful, redirecting directly');

      // Use window.location for a hard redirect
      window.location.href = '/home';
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="text-sm mt-2 p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
      >
        Try direct login (bypass router)
      </button>
    );
  }

  return (
    <div className="mt-6 p-4 border rounded-md border-blue-200 bg-blue-50">
      <h3 className="text-md font-medium mb-2">Direct Login</h3>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      
      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Logging in...' : 'Login Directly'}
        </button>
      </form>
    </div>
  );
} 