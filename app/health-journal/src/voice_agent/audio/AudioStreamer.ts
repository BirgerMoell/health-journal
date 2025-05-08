import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { debugLog } from '../utils/DebugLogger';

// Custom event emitter implementation for React Native
type EventCallback = (...args: any[]) => void;

class SimpleEventEmitter {
  private events: Record<string, EventCallback[]> = {};

  on(event: string, listener: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    
    // Return function to remove the listener
    return () => this.removeListener(event, listener);
  }

  removeListener(event: string, listener: EventCallback): void {
    if (!this.events[event]) return;
    
    const idx = this.events[event].indexOf(listener);
    if (idx !== -1) {
      this.events[event].splice(idx, 1);
    }
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) return false;
    
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (e) {
        console.error(`Error in event listener for "${event}":`, e);
      }
    });
    
    return true;
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

interface AudioStreamerOptions {
  sampleRate?: number;
  channels?: number;
  bitsPerSample?: number;
  updateIntervalMs?: number;
}

export class AudioStreamer extends SimpleEventEmitter {
  private recording: Audio.Recording | null = null;
  private subscription: { remove: () => void } | null = null;
  private isStreaming = false;
  private options: Required<AudioStreamerOptions>;
  private debugCounter = 0; // Counter for debug files
  private debugMode = true; // Set to true to enable debug mode
  private recordingStartTime = 0;
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false; // Flag to prevent concurrent processing
  private isRotating = false; // Flag to prevent concurrent rotations
  
  constructor(options: AudioStreamerOptions = {}) {
    super();
    this.options = {
      sampleRate: options.sampleRate || 16000,
      channels: options.channels || 1,
      bitsPerSample: options.bitsPerSample || 16,
      updateIntervalMs: options.updateIntervalMs || 500, // Increased to 500ms for stability
    };
  }

  async requestPermissions(): Promise<boolean> {
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  }

  async setupAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false
      });
      
      debugLog('AudioStreamer', 'Audio mode set up successfully');
    } catch (error) {
      debugLog('AudioStreamer', 'Error setting up audio mode:', error);
      throw error;
    }
  }

  private getRecordingOptions(): Audio.RecordingOptions {
    // Create a more compatible set of options
    return {
      android: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: this.options.sampleRate,
        numberOfChannels: this.options.channels,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
        sampleRate: this.options.sampleRate,
        numberOfChannels: this.options.channels,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };
  }

  async startStreaming(): Promise<void> {
    if (this.isStreaming) return;
    
    try {
      debugLog('AudioStreamer', 'Starting streaming');
      const permissionGranted = await this.requestPermissions();
      if (!permissionGranted) {
        throw new Error('Audio permission not granted');
      }

      await this.setupAudioMode();
      
      // Add a small delay before creating the recording
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.recording = new Audio.Recording();
      this.recordingStartTime = Date.now();
      
      // Ensure we have the correct options
      const recordingOptions = this.getRecordingOptions();
      debugLog('AudioStreamer', 'Preparing to record with options', recordingOptions);
      
      try {
        await this.recording.prepareToRecordAsync(recordingOptions);
      } catch (prepareError) {
        debugLog('AudioStreamer', 'Error preparing to record', { error: prepareError });
        
        // Try one more time with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        this.recording = new Audio.Recording();
        await this.recording.prepareToRecordAsync(recordingOptions);
      }
      
      // Set up the status update subscription
      const onRecordingStatusUpdate = async (status: any) => {
        // Only rotate on isDoneRecording if we're not already processing or rotating
        if (status.isDoneRecording && this.isStreaming && !this.isRotating && !this.isProcessing) {
          debugLog('AudioStreamer', 'Recording chunk complete');
          await this.processAudioChunk(); // Process before rotating
        }
      };
      
      this.recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
      this.subscription = {
        remove: () => {
          if (this.recording) {
            this.recording.setOnRecordingStatusUpdate(null);
          }
        }
      };
      
      // Start recording
      debugLog('AudioStreamer', 'Starting recording');
      await this.recording.startAsync();
      debugLog('AudioStreamer', 'Recording started successfully');
      
      // Start the processing interval
      this.isStreaming = true;
      this.processingInterval = setInterval(() => {
        // Only process if not already processing from the status update
        if (!this.isProcessing && !this.isRotating) {
          this.processAudioChunk().catch(error => {
            debugLog('AudioStreamer', 'Interval processing error:', error);
          });
        }
      }, this.options.updateIntervalMs);
      
      this.emit('streamingStarted');
      debugLog('AudioStreamer', 'Streaming started successfully');
    } catch (error) {
      debugLog('AudioStreamer', 'Error starting streaming:', error);
      this.emit('error', error);
      await this.cleanupResources();
      this.isStreaming = false;
    }
  }

  private async processAudioChunk() {
    if (!this.recording || !this.isStreaming || this.isProcessing) return;
    
    this.isProcessing = true;
    try {
      const uri = this.recording.getURI();
      if (!uri) {
        console.log("🎤 [AudioStreamer] No URI available for recording");
        this.isProcessing = false;
        return;
      }
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.log("🎤 [AudioStreamer] File does not exist, skipping");
        this.isProcessing = false;
        return;
      }
      
      // Skip processing if file is too small (likely empty or corrupted)
      if (fileInfo.size < 1000) {
        console.log(`🎤 [AudioStreamer] File too small (${fileInfo.size} bytes), skipping`);
        this.isProcessing = false;
        
        // If we've been recording for a while but still getting small files,
        // try rotating the recording to get a fresh start
        const duration = Date.now() - this.recordingStartTime;
        if (duration > 3000 && !this.isRotating) {
          console.log("🎤 [AudioStreamer] Recording not capturing audio properly, rotating...");
          await this.rotateRecording();
        }
        return;
      }
      
      const duration = Date.now() - this.recordingStartTime;
      console.log(`🎤 [AudioStreamer] Processing audio chunk: ${uri}`);
      console.log(`🎤 [AudioStreamer] Audio file size: ${fileInfo.size} bytes`);
      console.log(`🎤 [AudioStreamer] Recording duration: ${duration}ms`);
      
      // Read the audio data
      const audioData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log(`🎤 [AudioStreamer] Audio data length: ${audioData.length} chars`);
      
      // Only emit if we have substantial data
      if (audioData.length > 100) {
        // Store debug file if in debug mode
        if (this.debugMode) {
          await this.saveDebugAudioFile(audioData);
        }
        
        // Emit the audio data
        this.emit('audioData', audioData);
        console.log("🎤 [AudioStreamer] Emitted audioData event");
      } else {
        console.log("🎤 [AudioStreamer] Audio data too small, not emitting");
      }
      
      // Rotate recording after a certain duration to ensure fresh audio
      if (duration > 5000 && this.isStreaming && !this.isRotating) {
        await this.rotateRecording();
      }
    } catch (error) {
      console.error("🎤 [AudioStreamer] Error processing audio chunk:", error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  // Rotate to a new recording to avoid accumulating audio data
  private async rotateRecording() {
    if (!this.recording || !this.isStreaming || this.isRotating) return;
    
    this.isRotating = true;
    try {
      debugLog('AudioStreamer', 'Starting recording rotation');
      
      // First, stop and unload the current recording
      const currentRecording = this.recording;
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      
      // Clean up the old recording file
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
      
      // Wait a moment to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Set up audio mode again before creating new recording
      await this.setupAudioMode();
      
      // Create and start new recording
      this.recording = new Audio.Recording();
      const recordingOptions = this.getRecordingOptions();
      
      try {
        await this.recording.prepareToRecordAsync(recordingOptions);
      } catch (prepareError) {
        debugLog('AudioStreamer', 'Error preparing to record during rotation', { error: prepareError });
        
        // Try one more time with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        this.recording = new Audio.Recording();
        await this.recording.prepareToRecordAsync(recordingOptions);
      }
      
      // Set up the status update subscription again
      const onRecordingStatusUpdate = async (status: any) => {
        if (status.isDoneRecording && this.isStreaming && !this.isRotating && !this.isProcessing) {
          debugLog('AudioStreamer', 'Recording chunk complete');
          await this.processAudioChunk();
        }
      };
      
      this.recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
      
      await this.recording.startAsync();
      this.recordingStartTime = Date.now();
      
      debugLog('AudioStreamer', 'Rotated to new recording');
    } catch (error) {
      debugLog('AudioStreamer', 'Error rotating recording:', error);
      this.emit('error', error);
      
      // If rotation fails, stop streaming entirely to prevent further issues
      this.stopStreaming().catch(console.error);
    } finally {
      this.isRotating = false;
    }
  }
  
  // New method to save debug files
  private async saveDebugAudioFile(audioData: string) {
    try {
      const debugDir = `${FileSystem.documentDirectory}debug_audio/`;
      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(debugDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(debugDir, { intermediates: true });
      }
      
      // Save the audio data to a file
      const filename = `audio_chunk_${this.debugCounter++}.wav`;
      const fileUri = `${debugDir}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, audioData, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log(`🎤 [AudioStreamer] Saved debug file: ${fileUri}`);
    } catch (error) {
      console.error("🎤 [AudioStreamer] Failed to save debug file:", error);
    }
  }

  async stopStreaming(): Promise<void> {
    if (!this.isStreaming) return;
    
    console.log('🎤 [AudioStreamer] Stopping streaming');
    
    // Mark as not streaming immediately to prevent further operations
    this.isStreaming = false;
    
    // Clear processing interval
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    // Wait for any in-progress operations to complete
    while (this.isProcessing || this.isRotating) {
      console.log('🎤 [AudioStreamer] Waiting for in-progress operations to complete');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await this.cleanupResources();
    
    this.emit('streamingStopped');
    console.log('🎤 [AudioStreamer] Streaming stopped successfully');
  }
  
  private async cleanupResources(): Promise<void> {
    try {
      // Unsubscribe from updates
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
      
      // Stop and cleanup recording
      if (this.recording) {
        try {
          const status = await this.recording.getStatusAsync();
          if (status.isRecording) {
            await this.recording.stopAndUnloadAsync();
          } else if (status.isDoneRecording) {
            await this.recording.stopAndUnloadAsync();
          }
          
          const uri = this.recording.getURI();
          if (uri) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        } catch (error) {
          console.error('🎤 [AudioStreamer] Error during recording cleanup:', error);
        }
        
        this.recording = null;
      }
    } catch (error) {
      console.error("🎤 [AudioStreamer] Error cleaning up resources:", error);
    }
  }

  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }
} 