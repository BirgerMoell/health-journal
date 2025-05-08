import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import fs from 'fs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  let filePath = '';
  
  try {
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'tmp');
    await mkdir(tempDir, { recursive: true });
    
    // Get form data from request
    const formData = await request.formData();
    const audioFile = formData.get('file') as Blob;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert Blob to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save to temp file
    filePath = join(tempDir, `recording-${Date.now()}.webm`);
    await writeFile(filePath, buffer);

    // Create a readable stream for the file
    const fileStream = fs.createReadStream(filePath);

    // Call OpenAI transcription API directly
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fileStream
    });

    // Clean up the temporary file
    await unlink(filePath);

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Transcription error:', error);

    // Clean up temp file if it exists
    if (filePath) {
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }
    }

    return NextResponse.json(
      { error: 'Error transcribing audio', details: error.message },
      { status: 500 }
    );
  }
} 