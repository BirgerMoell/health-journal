// Helper to detect if running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};

// Helper to get base URL for API requests
const getBaseUrl = () => {
  // In Electron production build
  if (isElectron() && process.env.NODE_ENV === 'production') {
    return 'http://localhost:3001';  // Local Next.js server
  }
  // In development or web deployment
  return '';
};

/**
 * Make a regular API call to the chat endpoint
 */
export async function callAPI(prompt: string, systemPrompt?: string) {
  try {
    console.log('callAPI - Starting with prompt:', prompt);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, systemPrompt }),
    });

    console.log('callAPI - Response status:', response.status);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    console.log('callAPI - Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('callAPI - Received non-JSON response:', text);
      throw new Error('Invalid response format from server');
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('callAPI - Error response:', error);
      throw new Error(error.details || error.error || 'Failed to call API');
    }

    const data = await response.json();
    console.log('callAPI - Received data:', data);

    // Handle different response formats
    const result = data.text || data.content || data.message?.content || '';
    console.log('callAPI - Final result:', result);

    if (!result) {
      console.error('callAPI - No valid response content found in:', data);
      throw new Error('No valid response content received');
    }

    return result;
  } catch (error) {
    console.error('callAPI - Error:', error);
    throw error;
  }
}

/**
 * Make a streaming API call with chunk-by-chunk handling
 */
export async function streamAPI(
  prompt: string, 
  systemPrompt: string, 
  onChunk: (chunk: string, fullResponse: string) => void
) {
  try {
    console.log('Starting stream request');
    
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, systemPrompt }),
    });

    console.log('Stream response status:', response.status);
    
    if (!response.ok) {
      let errorText = 'Failed to stream API response';
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        errorText = errorData.error || errorData.details || errorText;
      } catch (e) {
        errorText = await response.text();
      }
      throw new Error(errorText);
    }

    // Ensure we have a readable stream
    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Get the reader
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream complete, received', chunkCount, 'chunks');
        break;
      }
      
      // Decode the chunk and update the response
      const chunk = decoder.decode(value, { stream: true });
      chunkCount++;
      console.log(`Chunk ${chunkCount}:`, chunk.substring(0, 20) + '...');
      
      fullResponse += chunk;
      onChunk(chunk, fullResponse);
    }

    return fullResponse;
  } catch (error) {
    console.error('Error in stream API:', error);
    throw error;
  }
}

/**
 * Transcribe audio file using OpenAI's Whisper API
 */
export async function transcribeAudio(audioFile: File) {
  try {
    console.log('Transcribing audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });
    
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      body: formData,
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Received non-JSON response:', await response.text());
      throw new Error('Invalid response format from server');
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Transcription API error response:', errorData);
      throw new Error(errorData.details || errorData.error || 'Failed to transcribe audio');
    }

    const data = await response.json();
    console.log('Transcription result:', data);
    
    if (!data.text) {
      throw new Error('No transcription text received');
    }
    
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

// Add these functions to your existing api.ts file
import { supabase } from './supabase';

// Load journal entries from Supabase
export async function loadJournalData() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get entries from Supabase
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading journal data:', error);
    return [];
  }
}

// Save journal entries to Supabase
export async function saveJournalData(entry: {
  id: string;
  text: string;
  date: string;
  [key: string]: any;
}) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Add user_id to entry
    const entryWithUserId = {
      ...entry,
      user_id: user.id
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entryWithUserId])
      .select();

    if (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Error in saveJournalData:', error);
    // Fall back to localStorage for testing or if not authenticated
    if (typeof window !== 'undefined') {
      const existingData = localStorage.getItem('journal-data');
      const entries = existingData ? JSON.parse(existingData) : [];
      entries.unshift(entry);
      localStorage.setItem('journal-data', JSON.stringify(entries));
    }
    return entry;
  }
}

// Save journal analysis to Supabase
export async function saveJournalAnalysis(entryId: string, analysis: string, sentiment: number = 0, moodDetected: string = '') {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Make sure entryId is a valid UUID
    if (!entryId || typeof entryId !== 'string') {
      throw new Error('Invalid entry ID');
    }
    
    // Insert analysis into Supabase
    const { data, error } = await supabase
      .from('journal_analysis')
      .insert([{
        user_id: user.id,
        entry_id: entryId,
        analysis: analysis,
        mood_detected: moodDetected,
        sentiment: sentiment,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error saving analysis:', error?.message || String(error));
      throw error;
    }

    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error in saveJournalAnalysis:', error?.message || String(error));
    return null;
  }
}

// Client-side API functions for Next.js

export async function callOpenAI(prompt: string, systemPrompt?: string) {
  try {
    console.log('Calling OpenAI with:', { prompt, systemPrompt });
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, systemPrompt }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Received non-JSON response:', await response.text());
      throw new Error('Invalid response format from server');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to call OpenAI API');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    // Make sure we're returning the text in the correct format
    return data.text || data.content || data.message?.content || '';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

// Add this debugging function to your api.ts file
export function debugEnvironment() {
  console.log('Environment variables check:', {
    OPENAI_API_KEY_EXISTS: typeof process.env.OPENAI_API_KEY !== 'undefined',
    OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    OPENAI_API_KEY_PREFIX: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 3) : 'none',
    NODE_ENV: process.env.NODE_ENV
  });
}

// Call this function early in your app initialization

// Add these new functions to store data in Supabase
export async function saveJournalEntry(text: string, metadata: any = {}) {
  if (!text.trim()) return null;
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Insert entry into Supabase with metadata
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: user.id,
        text: text.trim(),
        created_at: new Date().toISOString(),
        mood: metadata.mood || null,
        symptoms: metadata.symptoms || [],
        metadata: metadata
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // If AI insights are enabled, trigger insight generation
    if (text.length > 20) {
      try {
        generateHealthInsights(text, user.id);
      } catch (err) {
        console.error('Error generating insights:', err);
        // Don't fail the main function if insights fail
      }
    }
    
    return data;
  } catch (error: any) {
    console.error('Error saving journal entry:', error?.message || String(error));
    throw error;
  }
}

// Add function to generate AI insights based on journal entries
async function generateHealthInsights(entryText: string, userId: string) {
  try {
    // This would make a call to your AI endpoint
    const prompt = `Based on this health journal entry, identify potential health patterns or suggestions: "${entryText}"`;
    
    // Here we would typically call the AI
    const insight = await callAPI(prompt, 'You are a medical AI assistant analyzing health journal entries.');
    
    // Store the insight
    if (insight) {
      await supabase
        .from('health_insights')
        .insert([{
          user_id: userId,
          text: insight,
          source_entry: entryText,
          created_at: new Date().toISOString()
        }]);
    }
    
    return insight;
  } catch (error) {
    console.error('Error generating health insights:', error);
    throw error;
  }
}

export async function saveChatMessage(role: 'user' | 'assistant', content: string) {
  if (!content.trim()) return null;
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Insert chat message into Supabase
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        user_id: user.id,
        role,
        content: content.trim(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

export async function loadChatHistory() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get chat messages from Supabase
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}