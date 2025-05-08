import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Cleanup effect removed and moved to the new useEffect above

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Just set up cleanup
  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timer) clearInterval(timer);
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
        setRecording(null);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // If we're already recording or preparing, do nothing
      if (isRecording || isPreparing) return;
      
      setIsPreparing(true);
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please grant microphone permission to record audio.'
        );
        setIsPreparing(false);
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });

      // Create and prepare the recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start a timer to track recording duration
      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      
      setTimer(intervalId);
      setIsPreparing(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsPreparing(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Immediately update UI state
      setIsRecording(false);
      if (timer) clearInterval(timer);
      
      // Store current recording in a temp variable
      const currentRecording = recording;
      // Clear state immediately to prevent multiple recordings issue
      setRecording(null);
      
      await currentRecording.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = currentRecording.getURI();
      if (uri) {
        onRecordingComplete(uri);
      }
      
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {isPreparing ? (
        <View style={styles.preparingContainer}>
          <ActivityIndicator size="small" color="#4a7dfc" />
          <Text style={styles.preparingText}>Preparing microphone...</Text>
        </View>
      ) : isRecording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.durationContainer}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.durationText}>{formatTime(recordingDuration)}</Text>
          </View>
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Ionicons name="square" size={24} color="#fff" />
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
          <Ionicons name="mic" size={24} color="#fff" />
          <Text style={styles.recordText}>Record</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  recordButton: {
    flexDirection: 'row',
    backgroundColor: '#4a7dfc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  recordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    marginRight: 8,
  },
  durationText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  preparingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  preparingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
});

export default AudioRecorder;