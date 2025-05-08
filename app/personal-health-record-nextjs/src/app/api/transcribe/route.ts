import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Update your OpenAI client initialization with more debugging
const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key check in transcribe route:', {
  exists: !!apiKey,
  length: apiKey?.length,
  prefix: apiKey?.substring(0, 3)
});

const openai = new OpenAI({
  apiKey: apiKey,
  // Add these options for better debugging
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v1'
  }
});

export async function POST(request: NextRequest) {
  let filePath = '';
  
  try {
    console.log('Transcription API called');
    
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'tmp');
    await mkdir(tempDir, { recursive: true });
    
    // Get form data from request
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      console.error('No audio file provided');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    console.log('Audio file received:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });
    
    // Save file to disk temporarily
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    filePath = join(tempDir, `${uuidv4()}-${audioFile.name}`);
    await writeFile(filePath, buffer);
    
    console.log('File saved to:', filePath);
    
    // Create a file stream for OpenAI
    const fs = require('fs');
    const fileStream = fs.createReadStream(filePath);
    
    // For debugging, return a mock response first to verify the route works
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock transcription for testing');
      return NextResponse.json({ 
        text: "This is a test transcription to verify the API route is working correctly." 
      });
    }
    
    // If that works, then try the real transcription with minimal code
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fileStream,
      response_format: "json"
    });
    
    // Clean up the temporary file
    await unlink(filePath);
    
    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Transcription error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      status: error.status,
      type: error.type
    });
    
    // Clean up the temporary file if it exists
    if (filePath) {
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    return NextResponse.json(
      { error: 'Error transcribing audio', details: error.message },
      { status: 500 }
    );
  }
}