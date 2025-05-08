import { useEffect, useRef, useState, useCallback } from 'react';
import { VoiceAgentWebSocket } from '../websocket/VoiceAgentWebSocket';
import { AudioStreamer } from '../audio/AudioStreamer';

interface UseVoiceAgentProps {
  apiKey: string;
  agentId: string;
}

export const useVoiceAgent = ({ apiKey, agentId }: UseVoiceAgentProps) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const wsRef = useRef<VoiceAgentWebSocket | null>(null);
  const streamerRef = useRef<AudioStreamer | null>(null);

  // Initialize WebSocket connection if not already done
  const initializeWebSocket = useCallback(() => {
    if (!wsRef.current) {
      console.log('🔌 [WebSocket] Initializing connection');
      const ws = new VoiceAgentWebSocket({ apiKey, agentId });

      ws.on('ready', () => {
        console.log('🔌 [WebSocket] Connection ready');
        setIsConnected(true);
      });

      ws.on('error', (err) => {
        console.error('🔌 [WebSocket] Error:', err);
        setError('Connection error');
        setIsConnected(false);
      });

      ws.on('close', () => {
        console.log('🔌 [WebSocket] Connection closed');
      });

      wsRef.current = ws;
    }
  }, [apiKey, agentId]);

  // Initialize audio streamer if not already done
  const initializeAudioStreamer = useCallback(() => {
    if (!streamerRef.current) {
      console.log('🎤 [AudioStreamer] Initializing');
      const streamer = new AudioStreamer({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        updateIntervalMs: 100,
      });

      streamer.on('audioData', (audioData) => {
        if (wsRef.current?.isConnected()) {
          wsRef.current.sendAudioChunk(audioData);
        }
      });

      streamer.on('error', (err) => {
        console.error('🎤 [AudioStreamer] Error:', err);
        setError('Audio streaming error');
        setIsListening(false);
      });

      streamer.on('streamingStarted', () => {
        console.log('🎤 [AudioStreamer] Streaming started');
        setIsListening(true);
      });

      streamer.on('streamingStopped', () => {
        console.log('🎤 [AudioStreamer] Streaming stopped');
        setIsListening(false);
      });

      streamerRef.current = streamer;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      console.log('🎤 Starting voice agent');
      setError(null);

      // Initialize components
      initializeWebSocket();
      initializeAudioStreamer();

      // Connect to WebSocket
      wsRef.current?.connect();

      // Wait for WebSocket connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
        const checkConnection = () => {
          if (wsRef.current?.isConnected()) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });

      // Start audio streaming
      await streamerRef.current?.startStreaming();
    } catch (err) {
      console.error('🎤 Start error:', err);
      setError('Failed to start voice agent');
      setIsListening(false);
      await stopListening();
    }
  }, [initializeWebSocket, initializeAudioStreamer]);

  const stopListening = useCallback(async () => {
    console.log('🎤 Stopping voice agent');
    
    try {
      // Stop audio streaming
      if (streamerRef.current) {
        await streamerRef.current.stopStreaming();
      }
    } catch (err) {
      console.error('🎤 Stop error:', err);
      setError('Failed to stop voice agent');
    }
  }, []);

  const resetConversation = useCallback(async () => {
    console.log('Resetting conversation...');
    
    // Stop any current operations
    await stopListening();
    
    // Reset WebSocket
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    try {
      // Reinitialize WebSocket
      initializeWebSocket();
      wsRef.current?.connect();
    } catch (err) {
      console.error('Failed to reset conversation:', err);
      setError('Failed to start new conversation');
      setIsConnected(false);
    }
  }, [initializeWebSocket, stopListening]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.cleanup();
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      
      if (streamerRef.current) {
        streamerRef.current.stopStreaming();
        streamerRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    error,
    isListening,
    startListening,
    stopListening,
    resetConversation,
  };
};
