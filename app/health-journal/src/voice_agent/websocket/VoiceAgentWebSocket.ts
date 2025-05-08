import { SimpleEventEmitter } from './SimpleEventEmitter';
import { AudioSender } from './AudioSender';
import { AudioReceiver } from './AudioReceiver';
import { debugLog } from '../utils/DebugLogger';

interface VoiceAgentConfig {
  apiKey: string;
  agentId: string;
}

export class VoiceAgentWebSocket extends SimpleEventEmitter {
  private ws: WebSocket | null = null;
  private config: VoiceAgentConfig;
  private readonly WS_URL = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=`;
  private audioSender: AudioSender | null = null;
  private audioReceiver: AudioReceiver;
  private conversationId: string | null = null;
  private isProcessingMessage = false;
  private messageQueue: MessageEvent[] = [];

  constructor(config: VoiceAgentConfig) {
    super();
    this.config = config;
    this.audioReceiver = new AudioReceiver();
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public connect(): void {
    if (this.isConnected()) {
      debugLog('WebSocket', 'Already connected or connecting');
      return;
    }

    try {
      const url = `${this.WS_URL}${this.config.agentId}`;
      debugLog('WebSocket', 'Connecting to WebSocket', { url });
      
      this.ws = new WebSocket(url);
      this.audioSender = new AudioSender(this.ws);
      
      this.setupWebSocketHandlers();
    } catch (error) {
      debugLog('WebSocket', 'Connection error', { error });
      this.emit('error', error);
      this.disconnect();
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws || !this.audioSender) return;

    this.ws.onopen = () => {
      console.log('🔌 [WebSocket] Connection established');
      this.audioSender?.sendConversationInitialization();
      this.emit('ready');
    };

    this.ws.onmessage = (event) => {
      // Queue the message and process it
      this.messageQueue.push(event);
      this.processNextMessage();
    };

    this.ws.onerror = (error) => {
      console.error('🔌 [WebSocket] Error:', error);
      this.emit('error', error);
      this.disconnect();
    };

    this.ws.onclose = () => {
      console.log('🔌 [WebSocket] Connection closed');
      this.ws = null;
      this.audioSender = null;
      this.emit('close');
    };
  }

  private async processNextMessage(): Promise<void> {
    if (this.isProcessingMessage || this.messageQueue.length === 0) {
      return;
    }
    
    this.isProcessingMessage = true;
    
    try {
      const event = this.messageQueue.shift()!;
      let message;
      
      try {
        message = JSON.parse(event.data);
      } catch (parseError) {
        console.error('🔌 [WebSocket] Error parsing message:', parseError);
        console.log('🔌 [WebSocket] Raw message data:', event.data);
        this.isProcessingMessage = false;
        this.processNextMessage();
        return;
      }
      
      console.log('🔌 [WebSocket] Processing message type:', message.type);
      debugLog('WebSocket', 'Processing message', {
        type: message.type,
        timestamp: new Date().toISOString()
      });
      
      switch(message.type) {
        case 'conversation_initiation_metadata':
          this.conversationId = message.conversation_initiation_metadata_event.conversation_id;
          console.log('🔌 [WebSocket] Conversation initialized with ID:', this.conversationId);
          this.emit('conversationInitialized', this.conversationId);
          break;
        
        case 'ping':
          if (message.ping_event && message.ping_event.event_id) {
            console.log('🔌 [WebSocket] Received ping, sending pong');
            this.audioSender?.sendPong(message.ping_event.event_id);
          } else {
            console.log('🔌 [WebSocket] Invalid ping message format');
            debugLog('WebSocket', 'Invalid ping message format', message);
          }
          break;
        
        case 'audio':
          if (message.audio_event && message.audio_event.audio_base_64) {
            const audioData = message.audio_event.audio_base_64;
            console.log('🔌 [WebSocket] Received SERVER AUDIO RESPONSE, length:', audioData.length);
            
            if (audioData.length > 0) {
              console.log('🔌 [WebSocket] Playing audio from server');
              this.audioReceiver.handleAudioResponse(audioData)
                .then(() => console.log('🔌 [WebSocket] Server audio played successfully'))
                .catch(err => console.error('🔌 [WebSocket] Error playing server audio:', err));
            }
          } else {
            console.log('🔌 [WebSocket] Invalid audio message format');
            debugLog('WebSocket', 'Invalid audio message format', message);
          }
          break;
        
        case 'agent_response':
          if (message.agent_response_event && message.agent_response_event.agent_response) {
            console.log('🔌 [WebSocket] Received agent response:', 
              message.agent_response_event.agent_response);
            this.emit('agentResponse', message.agent_response_event.agent_response);
          } else {
            console.log('🔌 [WebSocket] Invalid agent response format');
            debugLog('WebSocket', 'Invalid agent response format', message);
          }
          break;
        
        case 'user_transcript':
          if (message.user_transcription_event && message.user_transcription_event.user_transcript) {
            console.log('🔌 [WebSocket] Received user transcript:', 
              message.user_transcription_event.user_transcript);
            this.emit('userTranscript', message.user_transcription_event.user_transcript);
          } else {
            console.log('🔌 [WebSocket] Invalid user transcript format');
            debugLog('WebSocket', 'Invalid user transcript format', message);
          }
          break;
        
        default:
          console.log(`🔌 [WebSocket] Unhandled message type: ${message.type}`);
          debugLog('WebSocket', 'Unhandled message', message);
      }
    } catch (error) {
      console.error('🔌 [WebSocket] Error processing message:', error);
      debugLog('WebSocket', 'Error processing message', { error });
    } finally {
      this.isProcessingMessage = false;
      
      // Process the next message in the queue
      if (this.messageQueue.length > 0) {
        setTimeout(() => this.processNextMessage(), 0);
      }
    }
  }

  public sendAudioChunk(audioData: string): void {
    if (this.ws.readyState !== WebSocket.OPEN) {
      debugLog('AudioSender', 'Cannot send audio: socket not open');
      return;
    }
    
    try {
      // Use the correct format expected by ElevenLabs
      const message = {
        user_audio_chunk: audioData
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

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.audioSender = null;
    }
  }

  public async cleanup() {
    await this.audioReceiver.cleanup();
    this.disconnect();
  }
} 
