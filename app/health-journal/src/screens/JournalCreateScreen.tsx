import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackScreenProps } from '../navigation/types';
import Button from '../components/Button';
import AudioRecorder from '../components/AudioRecorder';
import { createJournalEntry } from '../services/journal';
import { transcribeAudio } from '../services/transcription';
import { generateAIResponse } from '../services/openai';

const moods = ['Happy', 'Calm', 'Tired', 'Anxious', 'Energetic', 'Sad'];

const JournalCreateScreen: React.FC<RootStackScreenProps<'JournalCreate'>> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleRecordingComplete = async (audioUri: string) => {
    try {
      setTranscribing(true);
      const transcription = await transcribeAudio(audioUri);
      setText(transcription);
      setTranscribing(false);

      // Generate AI response after transcription is complete
      await generateResponse(transcription);
    } catch (error) {
      console.error('Error processing audio:', error);
      setTranscribing(false);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again or type your entry.');
    }
  };

  const generateResponse = async (content: string) => {
    if (!content.trim()) return;

    try {
      setGeneratingResponse(true);
      const response = await generateAIResponse(content);
      setAiResponse(response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      Alert.alert('Error', 'Failed to generate AI response. You can still save your entry.');
    } finally {
      setGeneratingResponse(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a journal entry.');
      return;
    }

    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text for your journal entry.');
      return;
    }

    setLoading(true);
    try {
      // Only pass the essential fields to avoid issues with missing columns
      await createJournalEntry(
        user.id,
        text,
        aiResponse || undefined,
        selectedMood || undefined,
        tags.length > 0 ? tags : undefined
      );
      
      navigation.navigate('Journal');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
         
            <Text style={styles.label}>Journal Entry</Text>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            
            {transcribing && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="small" color="#4a7dfc" />
                <Text style={styles.statusText}>Transcribing audio...</Text>
              </View>
            )}
            
            <TextInput
              style={styles.textInput}
              placeholder="Type your journal entry here..."
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
            />

           
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    style={styles.removeTagButton}
                  >
                    <Ionicons name="close" size={16} color="#4a7dfc" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {!aiResponse && !generatingResponse && text.trim() && (
              <Button
                title="Generate AI Response"
                onPress={() => generateResponse(text)}
                type="outline"
                style={styles.generateButton}
              />
            )}

            {generatingResponse && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="small" color="#4a7dfc" />
                <Text style={styles.statusText}>Generating AI response...</Text>
              </View>
            )}

            {aiResponse && (
              <View style={styles.aiResponseContainer}>
                <Text style={styles.aiResponseTitle}>AI Response:</Text>
                <Text style={styles.aiResponseText}>{aiResponse}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Save Entry"
                onPress={handleSave}
                loading={loading}
                disabled={loading || !text.trim()}
                style={styles.saveButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    marginTop: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  moodItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    marginRight: 8,
  },
  selectedMood: {
    backgroundColor: '#4a7dfc',
  },
  moodText: {
    color: '#4a7dfc',
    fontWeight: '500',
  },
  selectedMoodText: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    height: 180,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#dee2e6',
    color: '#212529',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    color: '#212529',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#4a7dfc',
    height: 50,
    width: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4a7dfc',
    fontWeight: '500',
    fontSize: 14,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    width: '100%',
  },
  generateButton: {
    marginTop: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  aiResponseContainer: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  aiResponseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a7dfc',
    marginBottom: 8,
  },
  aiResponseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
});

export default JournalCreateScreen;