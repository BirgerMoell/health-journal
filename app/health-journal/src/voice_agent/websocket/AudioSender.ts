import { debugLog } from '../utils/DebugLogger';

export class AudioSender {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  public sendAudioChunk(audioData: string): void {
    if (this.ws.readyState !== WebSocket.OPEN) {
      debugLog('AudioSender', 'Cannot send audio: socket not open');
      return;
    }
    
    try {
      const message = {
        type: "audio_data",
        audio_data: {
          audio: audioData,
          type: "base64"
        }
      };
      
      debugLog('AudioSender', 'Sending audio chunk', {
        chunkLength: audioData.length,
        timestamp: new Date().toISOString()
      });
      
      this.ws.send(JSON.stringify(message));
      debugLog('AudioSender', 'Audio chunk sent successfully');
    } catch (error) {
      debugLog('AudioSender', 'Error sending audio chunk', { error });
      throw error;
    }
  }

  public sendConversationInitialization(): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    
    try {
      const initData = {
        type: "conversation_start",
        conversation_config: {
          model_type: "eleven_turbo_v2",
          mode: "streaming",
          audio_format: "pcm_16000",
          sample_rate: 16000,
          enable_response_audio: true
        }
      };
      
      debugLog('AudioSender', 'Sending conversation initialization', initData);
      this.ws.send(JSON.stringify(initData));
      debugLog('AudioSender', 'Sent conversation initialization');
    } catch (error) {
      debugLog('AudioSender', 'Error sending initialization', { error });
    }
  }

  public sendPong(eventId: number): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    
    try {
      const pongMessage = {
        type: "pong",
        event_id: eventId
      };
      
      debugLog('AudioSender', 'Sending pong', { eventId });
      this.ws.send(JSON.stringify(pongMessage));
      debugLog('AudioSender', 'Sent pong response');
    } catch (error) {
      debugLog('AudioSender', 'Error sending pong', { error });
    }
  }
} 