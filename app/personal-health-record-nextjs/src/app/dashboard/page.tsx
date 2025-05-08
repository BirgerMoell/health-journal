'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SessionDebug from '@/components/SessionDebug';
import SessionVerifier from '@/components/SessionVerifier';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-teal-700">Personal Health Dashboard</h1>
        <SignOutButton />
      </div>
      
      <SessionVerifier />
      <SessionDebug />
      
      <div className="mb-6">
        <p className="text-gray-600">
          Welcome back, <span className="font-medium">{user?.email}</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Health Journal Card */}
        <Link href="/journal">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 text-teal-700">Health Journal</h2>
            <p className="text-gray-600">Record your daily health observations and get AI insights.</p>
          </motion.div>
        </Link>
        
        {/* Health AI Chat Card */}
        <Link href="/chat">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 text-teal-700">AI Health Assistant</h2>
            <p className="text-gray-600">Chat with an AI about your health concerns and questions.</p>
          </motion.div>
        </Link>
        
        {/* Profile Card */}
        <Link href="/profile">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 text-teal-700">Health Profile</h2>
            <p className="text-gray-600">Review and update your personal health information.</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
} 