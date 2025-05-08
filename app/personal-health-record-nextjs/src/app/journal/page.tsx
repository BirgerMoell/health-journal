'use client';

import { useState, useEffect } from 'react';
import JournalList from '@/components/JournalList';
import JournalEntryInput from '@/components/JournalEntryInput';
import { loadJournalData } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadEntries() {
      try {
        const data = await loadJournalData();
        setEntries(data || []);
      } catch (error) {
        console.error('Error loading journal entries:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEntries();
  }, []);

  const handleNewEntry = (text: string) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text,
      date: new Date().toISOString()
    };
    setEntries(prevEntries => [newEntry, ...prevEntries]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Health Journal</h1>
        </div>
        
        <div className="space-y-8">
          <JournalEntryInput userId={user?.id} />
          <JournalList entries={entries} />
        </div>
      </div>
    </ProtectedRoute>
  );
} 