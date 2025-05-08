import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { debugLog } from '../utils/DebugLogger';

export class AudioReceiver {
  private currentSound: Audio.Sound | null = null;
  private isPlayingAudio = false;
  private playbackQueue: string[] = [];

  async handleAudioResponse(audioBase64: string) {
    try {
      // Use console.log for guaranteed visibility
      console.log('🔊 [AudioReceiver] Received audio data for playback, length:', audioBase64.length);
      
      // Also log with debugLog
      debugLog('AudioReceiver', 'Processing new audio chunk', {
        dataLength: audioBase64.length,
        timestamp: new Date().toISOString()
      });

      // Add to queue and process if not already playing
      this.playbackQueue.push(audioBase64);
      console.log('🔊 [AudioReceiver] Added to queue, queue length:', this.playbackQueue.length);
      
      if (!this.isPlayingAudio) {
        console.log('🔊 [AudioReceiver] Starting queue processing');
        await this.processQueue();
      } else {
        console.log('🔊 [AudioReceiver] Already playing audio, queued for later');
      }

    } catch (error) {
      console.error('🔊 [AudioReceiver] Error handling audio response:', error);
      debugLog('AudioReceiver', 'Error processing audio', { error });
      await this.cleanup();
    }
  }

  // Process the queue
  private async processQueue(): Promise<void> {
    if (this.playbackQueue.length === 0) {
      console.log('🔊 [AudioReceiver] Queue empty, nothing to process');
      return;
    }

    if (this.isPlayingAudio) {
      console.log('🔊 [AudioReceiver] Already playing audio, will process later');
      return;
    }

    try {
      console.log('🔊 [AudioReceiver] Beginning queue processing');
      this.isPlayingAudio = true;
      
      await this.setupAudioMode();
      
      // Process each audio chunk in the queue
      while (this.playbackQueue.length > 0) {
        const nextAudio = this.playbackQueue.shift();
        if (nextAudio) {
          console.log('🔊 [AudioReceiver] Playing next audio chunk from queue');
          await this.playAudio(nextAudio);
          console.log('🔊 [AudioReceiver] Finished playing audio chunk');
        }
      }
    } catch (error) {
      console.error('🔊 [AudioReceiver] Error processing queue:', error);
      debugLog('AudioReceiver', 'Error processing audio queue', { error });
    } finally {
      console.log('🔊 [AudioReceiver] Queue processing complete');
      this.isPlayingAudio = false;
    }
  }

  private async setupAudioMode(): Promise<void> {
    console.log('🔊 [AudioReceiver] Setting up audio mode');
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('🔊 [AudioReceiver] Audio mode set up successfully');
    } catch (error) {
      console.error('🔊 [AudioReceiver] Error setting up audio mode:', error);
      throw error;
    }
  }

  private async playAudio(audioBase64: string): Promise<void> {
    try {
      console.log('🔊 [AudioReceiver] Starting audio playback preparation');
      
      // Clean up any previous sound before creating a new one
      await this.cleanup();
      
      const wavHeader = this.createWavHeader(audioBase64.length * 0.75); // Adjust for base64 encoding
      const audioData = this.base64ToUint8Array(audioBase64);
      
      console.log('🔊 [AudioReceiver] Created WAV header and decoded base64', {
        headerLength: wavHeader.length,
        audioDataLength: audioData.length
      });

      const wavData = new Uint8Array(wavHeader.length + audioData.length);
      wavData.set(wavHeader);
      wavData.set(audioData, wavHeader.length);

      const tempFilePath = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.wav`;
      
      // Convert to base64 for file writing
      const wavBase64 = btoa(String.fromCharCode.apply(null, Array.from(wavData)));
      
      console.log('🔊 [AudioReceiver] Writing audio file', { path: tempFilePath });
      
      await FileSystem.writeAsStringAsync(
        tempFilePath,
        wavBase64,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      this.currentSound = new Audio.Sound();
      console.log('🔊 [AudioReceiver] Loading audio file');
      
      const status = await this.currentSound.loadAsync(
        { uri: tempFilePath },
        { shouldPlay: true, volume: 1.0 }
      );

      if (!status.isLoaded) {
        throw new Error('Failed to load audio file');
      }

      console.log('🔊 [AudioReceiver] Starting playback');

      // Create a promise that resolves when playback finishes
      return new Promise((resolve) => {
        this.currentSound?.setOnPlaybackStatusUpdate(async (playbackStatus) => {
          if (!playbackStatus.isLoaded) return;
          
          if (playbackStatus.didJustFinish) {
            console.log('🔊 [AudioReceiver] Playback finished, cleaning up');
            await this.cleanup();
            await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('🔊 [AudioReceiver] Error in playAudio:', error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    if (this.currentSound) {
      try {
        console.log('🔊 [AudioReceiver] Cleaning up current sound');
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      } catch (e) {
        console.error('🔊 [AudioReceiver] Error cleaning up sound:', e);
        debugLog('AudioReceiver', 'Error cleaning up sound', { error: e });
      }
    }
  }

  private createWavHeader(dataLength: number): Uint8Array {
    const numChannels = 1; // Mono
    const sampleRate = 16000; // 16kHz
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const totalLength = 36 + dataLength;

    const header = new Uint8Array(44);
    const dv = new DataView(header.buffer);

    // RIFF chunk descriptor
    dv.setUint8(0, 'R'.charCodeAt(0));
    dv.setUint8(1, 'I'.charCodeAt(0));
    dv.setUint8(2, 'F'.charCodeAt(0));
    dv.setUint8(3, 'F'.charCodeAt(0));
    dv.setUint32(4, totalLength, true);
    dv.setUint8(8, 'W'.charCodeAt(0));
    dv.setUint8(9, 'A'.charCodeAt(0));
    dv.setUint8(10, 'V'.charCodeAt(0));
    dv.setUint8(11, 'E'.charCodeAt(0));

    // fmt sub-chunk
    dv.setUint8(12, 'f'.charCodeAt(0));
    dv.setUint8(13, 'm'.charCodeAt(0));
    dv.setUint8(14, 't'.charCodeAt(0));
    dv.setUint8(15, ' '.charCodeAt(0));
    dv.setUint32(16, 16, true); // Subchunk1Size
    dv.setUint16(20, 1, true); // AudioFormat (PCM)
    dv.setUint16(22, numChannels, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, byteRate, true);
    dv.setUint16(32, blockAlign, true);
    dv.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    dv.setUint8(36, 'd'.charCodeAt(0));
    dv.setUint8(37, 'a'.charCodeAt(0));
    dv.setUint8(38, 't'.charCodeAt(0));
    dv.setUint8(39, 'a'.charCodeAt(0));
    dv.setUint32(40, dataLength, true);

    return header;
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  }
} 