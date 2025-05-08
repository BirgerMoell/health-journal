'use client';

import { useState, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { transcribeAudio } from '@/lib/api';

type JournalEntryProps = {
  onSubmit: (entryText: string) => void;
};

export default function JournalEntry({ onSubmit }: JournalEntryProps) {
  const [entryText, setEntryText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEntryText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryText.trim()) {
      onSubmit(entryText);
      setEntryText('');
    }
  };

  const startRecording = async () => {
    try {
      // Reset audio chunks
      chunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder with best available format
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          console.log('Audio blob size:', audioBlob.size);
          
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          
          try {
            const transcription = await transcribeAudio(audioFile);
            setEntryText(prev => prev + ' ' + transcription);
          } catch (error) {
            console.error('Transcription error:', error);
            setEntryText(prev => prev + " [Voice input received]");
          }
        } catch (error) {
          console.error('Error processing audio:', error);
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const safeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date();
      }
      return date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={entryText}
        onChange={handleTextChange}
        placeholder="How are you feeling? Describe your current health..."
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ease-in-out"
      />
      
      <div className="flex space-x-2">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-300 ease-in-out text-sm sm:text-base"
        >
          Submit
        </motion.button>
        
        <motion.button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`min-w-[44px] w-11 h-10 sm:w-12 sm:h-11 rounded-md transition duration-300 ease-in-out flex items-center justify-center ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <FaStop className="text-lg sm:text-xl" /> : <FaMicrophone className="text-lg sm:text-xl" />}
        </motion.button>
      </div>
    </form>
  );
}