import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../navigation/types';
import Button from '../components/Button';
import Card from '../components/Card';
import Markdown from 'react-native-markdown-display';
import { useFonts, Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { 
  deleteJournalEntry, 
  updateJournalEntryAIResponse, 
  ChatMessage as DBChatMessage,
  createChatMessage,
  getChatMessages,
  initializeConversation
} from '../services/journal';
import { generateAIResponse } from '../services/openai';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const JournalEntryScreen: React.FC<RootStackScreenProps<'JournalEntry'>> = ({
  navigation,
  route,
}) => {
  const { user, healthProfile } = useAuth();
  const { entry } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [userInput, setUserInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Load Lato font
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
  });
  
  // Handle the case when ai_response property doesn't exist
  const [aiResponse, setAiResponse] = useState<string | null>(
    entry.ai_response !== undefined ? entry.ai_response : null
  );
  
  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteJournalEntry(entry.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry. Please try again.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Fetch existing messages or initialize new conversation
  useEffect(() => {
    if (!user) return;
    
    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        
        // Try to get existing messages
        const existingMessages = await getChatMessages(entry.id);
        
        if (existingMessages.length > 0) {
          // Convert from DB format to component format
          const formattedMessages: ChatMessage[] = existingMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at)
          }));
          
          setMessages(formattedMessages);
        } else {
          // Initialize a new conversation
          const initialMessages = await initializeConversation(
            user.id,
            entry.id,
            entry.text,
            entry.ai_response || null
          );
          
          // Convert from DB format to component format
          const formattedMessages: ChatMessage[] = initialMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at)
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        Alert.alert('Error', 'Failed to load conversation history.');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    loadMessages();
  }, [user, entry.id]);
  
  // Auto-generate AI response when the entry is viewed and doesn't have one
  useEffect(() => {
    console.log("Auto-generate effect running:", {
      hasAiResponse: !!aiResponse,
      isGenerating: generatingResponse,
      hasEntryText: !!entry.text,
      isLoading: loadingMessages,
      messagesCount: messages.length
    });
    
    if (!aiResponse && !generatingResponse && entry.text && !loadingMessages) {
      // Check if there's no AI message in the messages array
      const hasAiMessage = messages.some(msg => !msg.isUser);
      if (!hasAiMessage) {
        console.log("Generating initial AI response");
        generateResponse();
      }
    }
  }, [loadingMessages, messages, aiResponse, generatingResponse, entry.text]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages]);

  const generateResponse = async (promptText: string = entry.text) => {
    if (!user) return;
    
    try {
      setGeneratingResponse(true);
      const response = await generateAIResponse(promptText, healthProfile);
      
      // If this is the first response, update the entry in the database
      if (!aiResponse) {
        setAiResponse(response);
        await updateJournalEntryAIResponse(entry.id, response);
      }
      
      // Check if this message already exists (to prevent duplicates)
      const messageExists = messages.some(msg => 
        !msg.isUser && msg.text === response
      );
      
      if (messageExists) {
        console.log('Message already exists, skipping...');
        setGeneratingResponse(false); // Make sure to clear the generating flag
        return;
      }
      
      // Save AI message to database
      const savedMessage = await createChatMessage(
        user.id,
        entry.id,
        response,
        false
      );
      
      // Add response to messages
      const newMessage: ChatMessage = {
        id: savedMessage.id,
        text: response,
        isUser: false,
        timestamp: new Date(savedMessage.created_at)
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Scroll to bottom after adding new message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      Alert.alert('Error', 'Failed to generate AI response. Please try again.');
    } finally {
      setGeneratingResponse(false);
    }
  };
  
  const sendMessage = async () => {
    if (!userInput.trim() || !user) return;
    
    const userMessageText = userInput.trim();
    setUserInput('');
    
    try {
      // Save user message to database
      const savedMessage = await createChatMessage(
        user.id,
        entry.id,
        userMessageText,
        true
      );
      
      // Add user message to state
      const userMessage: ChatMessage = {
        id: savedMessage.id,
        text: userMessageText,
        isUser: true,
        timestamp: new Date(savedMessage.created_at)
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Scroll to bottom after adding user message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Generate AI response based on the new message
      await generateResponse(userMessageText);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send your message. Please try again.');
    }
  };

  // Show a loading screen until fonts are loaded
  if (!fontsLoaded) {
    return (
      <View style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.safeArea} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
          {entry.mood && <Text style={styles.mood}>{entry.mood}</Text>}
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>
      
      {entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <View style={styles.tagsList}>
            {entry.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading conversation...</Text>
          </View>
        ) : (
          <>
            {messages.map((message) => (
              <View 
                key={message.id} 
                style={[
                  styles.messageBubble, 
                  message.isUser ? styles.userBubble : styles.aiBubble
                ]}
              >
                {message.isUser ? (
                  <Text 
                    style={[
                      styles.messageText,
                      styles.userMessageText
                    ]}
                  >
                    {message.text}
                  </Text>
                ) : (
                  <Markdown
                    style={{
                      body: styles.aiMessageText,
                      heading1: styles.markdownH1,
                      heading2: styles.markdownH2,
                      heading3: styles.markdownH3,
                      strong: styles.markdownStrong,
                      bullet_list: styles.markdownList,
                      ordered_list: styles.markdownList,
                      bullet_list_item: styles.markdownListItem,
                      ordered_list_item: styles.markdownListItem,
                      code_block: styles.markdownCodeBlock,
                      code_inline: styles.markdownCodeInline,
                      paragraph: styles.markdownParagraph,
                      link: styles.markdownLink,
                      blockquote: styles.markdownBlockquote,
                    }}
                  >
                    {message.text}
                  </Markdown>
                )}
                <Text 
                  style={[
                    styles.messageTime,
                    message.isUser ? styles.userMessageTime : styles.aiMessageTime
                  ]}
                >
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
            ))}
            
            {generatingResponse && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>AI is responding...</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            (loadingMessages || generatingResponse) && styles.inputDisabled
          ]}
          placeholder="Type a message..."
          value={userInput}
          onChangeText={setUserInput}
          multiline
          numberOfLines={1}
          maxLength={500}
          editable={!loadingMessages && !generatingResponse}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!userInput.trim() || loadingMessages || generatingResponse) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!userInput.trim() || loadingMessages || generatingResponse}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerContent: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  date: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Lato_700Bold',
  },
  mood: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'Lato_400Regular',
  },
  tagsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 13,
    fontFamily: 'Lato_400Regular',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatContent: {
    paddingBottom: 24,
  },
  messageBubble: {
    padding: 12,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    maxWidth: '80%',
    marginRight: 12,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#000000',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Lato_400Regular',
  },
  aiMessageText: {
    color: '#000000',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Lato_400Regular',
  },
  markdownH1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
    fontFamily: 'Lato_700Bold',
  },
  markdownH2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 8,
    fontFamily: 'Lato_700Bold',
  },
  markdownH3: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Lato_700Bold',
  },
  markdownStrong: {
    fontWeight: 'bold',
    fontFamily: 'Lato_700Bold',
    color: '#000000',
  },
  markdownList: {
    marginLeft: 20,
  },
  markdownListItem: {
    marginBottom: 8,
    fontFamily: 'Lato_400Regular',
    fontSize: 18,
    lineHeight: 26,
  },
  markdownCodeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  markdownCodeInline: {
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 16,
  },
  markdownParagraph: {
    marginBottom: 12,
    fontFamily: 'Lato_400Regular',
    fontSize: 18,
    lineHeight: 26,
  },
  markdownLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontFamily: 'Lato_400Regular',
  },
  markdownBlockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 12,
    marginLeft: 12,
    marginVertical: 8,
    fontFamily: 'Lato_400Regular',
    fontStyle: 'italic',
    fontSize: 18,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: '#9e9e9e',
  },
  aiMessageTime: {
    color: '#6c757d',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    fontFamily: 'Lato_400Regular',
  },
  inputDisabled: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
});

export default JournalEntryScreen;