import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

interface TranscriptionResponse {
  text: string;
}

export const transcribeAudio = async (audioUri: string): Promise<string> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }

    // Create a random boundary for the FormData
    const boundary = await Crypto.randomUUID();
    const formData = new FormData();
    
    // Convert local URI to blob
    const fileBlob = await fetchBlobFromUri(audioUri);
    
    // Add the audio file to FormData
    formData.append('file', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    
    // Add model parameter
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    
    // Make API request
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const data = await response.json() as TranscriptionResponse;
    return data.text.trim();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

// Helper function to fetch blob from URI
async function fetchBlobFromUri(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}