'use client';

import { useState, useEffect } from 'react';
import { callAPI, saveJournalAnalysis } from '@/lib/api';

interface JournalEntryDisplayProps {
  entry: {
    id: string;
    text: string;
    date: string;
    analysis?: string;
  };
  onAnalysis?: (analysis: string) => void;
}

export default function JournalEntryDisplay({ entry, onAnalysis }: JournalEntryDisplayProps) {
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>(entry.analysis || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    setIsAnalyzing(true);
    setAnalysis('');
    setError(null);
    
    async function analyzeEntry() {
      try {
        // Check if entry already has analysis
        if (entry.analysis) {
          setAnalysis(entry.analysis);
          setIsAnalyzing(false);
          return;
        }
        
        const prompt = `Please analyze this health journal entry and provide insights: "${entry.text}"`;
        
        const result = await callAPI(
          prompt,
          'You are an expert medical doctor providing health advice and analysis.'
        );
        
        if (isMounted) {
          setAnalysis(result);
          if (onAnalysis) {
            onAnalysis(result);
          }
          
          // Save analysis to Supabase
          try {
            await saveJournalAnalysis(entry.id, result);
          } catch (saveErr) {
            console.error('Error saving analysis to database:', saveErr);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error analyzing entry:', err);
          setError(err instanceof Error ? err.message : 'Failed to analyze entry');
        }
      } finally {
        if (isMounted) {
          setIsAnalyzing(false);
        }
      }
    }

    analyzeEntry();
    
    return () => {
      isMounted = false;
    };
  }, [entry.id, entry.text, entry.analysis, onAnalysis]);

  const formatDate = (dateString: string) => {
    try {
      // Create a valid date object
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Return formatted date
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">Selected Entry:</h3>
          <div className="text-sm text-gray-500">
            {entry.created_at ? formatDate(entry.created_at) : 'Unknown date'}
          </div>
        </div>
        <p className="text-gray-800 mb-4">{entry.text}</p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-2">AI Analysis:</h3>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : isAnalyzing ? (
          <div className="text-gray-500">Analyzing...</div>
        ) : analysis ? (
          <div className="prose max-w-none">
            {analysis.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No analysis available</div>
        )}
      </div>
    </div>
  );
} 