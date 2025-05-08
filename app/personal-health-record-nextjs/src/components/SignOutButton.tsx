'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function SignOutButton() {
  const { signOut, isLoading } = useAuth();

  return (
    <button
      onClick={signOut}
      disabled={isLoading}
      className="px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
} 