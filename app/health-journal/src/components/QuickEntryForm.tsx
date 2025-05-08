import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import AudioRecorder from './AudioRecorder';
import { transcribeAudio } from '../services/openai';
import Colors from '../constants/Colors';

interface QuickEntryFormProps {
  onSave: (text: string) => void;
}

const QuickEntryForm: React.FC<QuickEntryFormProps> = ({ onSave }) => {
  const [text, setText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onSave(text.trim());
      setText(''); // Clear text after saving
    }
  };

  const handleRecordingComplete = async (audioUri: string) => {
    setShowRecorder(false);
    setIsTranscribing(true);
    
    try {
      const transcription = await transcribeAudio(audioUri);
      setText((prev) => (prev ? `${prev}\n${transcription}` : transcription));
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="How are you feeling today?"
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
        placeholderTextColor="#aaa"
      />
      
      <View style={styles.actionsContainer}>
        {isTranscribing ? (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.transcribingText}>Transcribing...</Text>
          </View>
        ) : showRecorder ? (
          <View style={styles.recordingWrapper}>
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete} 
            />
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.recordButton}
              onPress={() => setShowRecorder(true)}
            >
              <Ionicons name="mic" size={18} color="#fff" style={styles.recordIcon} />
              <Text style={styles.recordText}>Record</Text>
            </TouchableOpacity>
            
            <Button
              title="Save Entry"
              onPress={handleSubmit}
              disabled={!text.trim()}
              style={styles.saveButton}
              type="primary"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16,
    color: '#212529',
    textAlignVertical: 'top',
  },
  actionsContainer: {
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIcon: {
    marginRight: 6,
  },
  recordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: 120,
  },
  recordingWrapper: {
    width: '100%',
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  transcribingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.darkGray,
  },
});

export default QuickEntryForm;