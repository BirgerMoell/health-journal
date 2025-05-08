import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('Stream API route called');
  
  try {
    const { prompt, systemPrompt = 'You are an expert medical doctor providing health advice and analysis.' } = await request.json();
    console.log('Received prompt:', prompt.substring(0, 50) + '...');

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'No prompt provided' }), 
        { status: 400 }
      );
    }

    console.log('Creating OpenAI stream');
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true,
      temperature: 0.0,
      max_tokens: 1000,
    });

    // Set up streaming
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Process the stream in a separate async function
    (async () => {
      let chunkCount = 0;
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            chunkCount++;
            await writer.write(encoder.encode(content));
          }
        }
        console.log(`Stream complete, sent ${chunkCount} chunks`);
      } catch (error) {
        console.error('Error processing stream:', error);
      } finally {
        await writer.close();
      }
    })();

    // Return the streaming response with necessary headers
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('Stream API error:', error);
    return new Response(
      JSON.stringify({ error: 'Error streaming from OpenAI API', details: error.message }), 
      { status: 500 }
    );
  }
}