# Voice Streaming Implementation Details

## Current Status

### Working Components
1. **Receiving Audio from ElevenLabs**
   - WebSocket connection establishes successfully
   - Server messages are received and processed correctly
   - Audio playback from ElevenLabs works as expected
   - Message types (conversation_initiation_metadata, audio, agent_response) are handled properly

### Non-Working Components
2. **Sending Audio to ElevenLabs**
   - Audio is being recorded but not streaming correctly
   - Only initial connection works, subsequent audio chunks aren't being processed by the server

## Implementation Details

### Audio Recording (AudioStreamer.ts)

- **Recording Setup**: The recording is set up correctly, but the audio isn't being streamed to the server.
- **Audio Mode**: The audio mode is set up correctly, but the audio isn't being streamed to the server.
- **Recording Cleanup**: The recording is cleaned up correctly, but the audio isn't being streamed to the server.
- **Streaming**: The audio isn't being streamed to the server.

Current recording flow:
1. User starts recording
2. Audio mode is set up with proper permissions
3. Recording starts with these parameters:
   - Sample rate: 16kHz
   - Channels: 1 (mono)
   - Bit depth: 16-bit
   - Format: PCM WAV
4. Audio is processed in chunks every 100ms
5. Chunks are rotated to prevent memory issues

### WebSocket Communication (VoiceAgentWebSocket.ts)

- **Connection**: The WebSocket connection is established correctly, but the audio isn't being streamed to the server.
- **Message Handling**: The message handling is correct, but the audio isn't being streamed to the server.
- **Audio Sending**: The audio isn't being streamed to the server.

Current WebSocket flow:
1. Connection is established
2. Initial message is sent to initiate the conversation
3. Audio chunks are sent to the server
4. Server processes the audio and sends responses back

Message flow:
1. WebSocket connects to ElevenLabs
2. Initial handshake succeeds
3. Audio chunks are sent in base64 format
4. Server responses are received and processed

## Known Issues

### Audio Streaming Issues
1. **Chunk Processing**
   - Audio chunks might not be in the correct format
   - Base64 encoding might need adjustment
   - Chunk size might be too large/small

2. **Timing Issues**
   - Rotation of recordings might interrupt the stream
   - Processing interval might not be optimal

3. **Format Concerns**
   - Need to verify if the audio format matches exactly what ElevenLabs expects
   - WAV headers might need adjustment

## Next Steps

1. **Verify Audio Format**
   - Double-check the exact audio specifications required by ElevenLabs
   - Ensure WAV headers are correctly formatted

2. **Improve Chunk Processing**
   - Implement better error handling for audio processing
   - Add logging for chunk sizes and timing
   - Verify base64 encoding is correct

3. **Testing Strategy**
   - Add debug logging for audio chunks
   - Save sample chunks for analysis
   - Compare working vs non-working audio samples

## Component Diagram
mermaid
graph TD
A[User Interface] --> B[VoiceAgent Component]
B --> C[useVoiceAgent Hook]
C --> D[AudioStreamer]
C --> E[VoiceAgentWebSocket]
D --> E
E --> F[ElevenLabs API]
mermaid
sequenceDiagram
participant UI as User Interface
participant AS as AudioStreamer
participant WS as WebSocket
participant API as ElevenLabs API
UI->>AS: startListening()
AS->>AS: setupAudioMode()
AS->>AS: startRecording()
loop Every 100ms
AS->>AS: processAudioChunk()
AS->>WS: sendAudioChunk()
WS->>API: Send base64 audio
end
API-->>WS: Send response
WS-->>UI: Update UI
Settings
json
{
"sampleRate": 16000,
"channels": 1,
"bitsPerSample": 16,
"format": "wav",
"updateInterval": 100
}
Format
json
{
"user_audio_chunk": "base64EncodedAudioData=="
}
)
This documentation provides a comprehensive overview of the current implementation, highlighting both working and non-working components, and suggesting next steps for debugging and improvement.


## Debugging Tips

1. Enable debug mode in AudioStreamer to save audio chunks
2. Check WebSocket connection status regularly
3. Monitor chunk sizes and processing times
4. Verify audio format with a WAV analyzer
5. Test with shorter audio segments firsta

## References

1. [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
2. [ElevenLabs WebSocket API](https://elevenlabs.io/docs/conversational-ai/api-reference/conversational-ai/websocket)
3. [WAV Format Specification](http://soundfile.sapp.org/doc/WaveFormat/)

