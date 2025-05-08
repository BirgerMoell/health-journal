import { HealthProfile } from '../context/AuthContext';

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface TranscriptionResponse {
  text: string;
}

export const generateAIResponse = async (
  prompt: string, 
  healthProfile?: HealthProfile
): Promise<string> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(healthProfile),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get AI response');
    }

    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

// Function to build system prompt with health profile data
const getSystemPrompt = (healthProfile?: HealthProfile): string => {
  let systemPrompt = 'You are an expert medical doctor providing health advice and analysis.';
  
  if (healthProfile) {
    const profileData = [];
    
    if (healthProfile.age) profileData.push(`Age: ${healthProfile.age}`);
    if (healthProfile.gender) profileData.push(`Gender: ${healthProfile.gender}`);
    if (healthProfile.medicalConditions) profileData.push(`Medical Conditions: ${healthProfile.medicalConditions}`);
    if (healthProfile.medications) profileData.push(`Medications: ${healthProfile.medications}`);
    if (healthProfile.allergies) profileData.push(`Allergies: ${healthProfile.allergies}`);
    if (healthProfile.lifestyle) profileData.push(`Lifestyle: ${healthProfile.lifestyle}`);
    
    if (profileData.length > 0) {
      systemPrompt += '\n\nUser Health Profile:\n' + profileData.join('\n');
      systemPrompt += '\n\nPlease consider this health profile information when providing advice and analysis.';
    }
  }
  
  return systemPrompt;
};

export const transcribeAudio = async (audioUri: string): Promise<string> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // Send the request to OpenAI's audio transcription API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // Don't set Content-Type header for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to transcribe audio');
    }

    const data = await response.json() as TranscriptionResponse;
    return data.text.trim();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};