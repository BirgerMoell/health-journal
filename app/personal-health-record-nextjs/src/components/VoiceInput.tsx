import { useState } from 'react';
import { transcribeAudio } from '../lib/api';

export default function VoiceInput({ onTranscription }: { onTranscription: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };
      
      recorder.onstop = handleRecordingStop;
      
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
      setAudioChunks([]);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleRecordingStop = async () => {
    try {
      setIsProcessing(true);
      
      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunks, { 
        type: 'audio/mp3'
      });
      
      // Create a File object from the Blob
      const audioFile = new File([audioBlob], 'recording.mp3', { 
        type: 'audio/mp3',
        lastModified: Date.now()
      });
      
      console.log('Sending audio for transcription:', {
        size: audioFile.size,
        type: audioFile.type
      });
      
      // Send to transcription API
      const transcription = await transcribeAudio(audioFile);
      
      // Pass transcription to parent component
      onTranscription(transcription);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(`Error transcribing audio: ${err.message}`);
      // Still notify parent with error message
      onTranscription('[Transcription failed. Please try again.]');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-input">
      {error && <div className="error-message">{error}</div>}
      
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
      >
        {isRecording ? 'Stop Recording' : isProcessing ? 'Processing...' : 'Start Recording'}
      </button>
      
      {isProcessing && <div className="processing-indicator">Transcribing audio...</div>}
    </div>
  );
} 