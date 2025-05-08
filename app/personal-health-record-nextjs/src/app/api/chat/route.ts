import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt = 'You are an expert medical doctor providing health advice and analysis.' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.0,
      max_tokens: 1000,
    });

    // Make sure we're sending the response in a consistent format
    return NextResponse.json({
      text: completion.choices[0].message.content,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Error calling OpenAI API', details: error.message },
      { status: 500 }
    );
  }
}