import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackScreenProps } from '../navigation/types';
import Card from '../components/Card';
import Button from '../components/Button';
import JournalEntryCard from '../components/JournalEntryCard';
import GradientBackground from '../components/GradientBackground';
import QuickEntryForm from '../components/QuickEntryForm';
import { getJournalEntries, createJournalEntry, JournalEntry } from '../services/journal';
import Colors from '../constants/Colors';
import { WebView } from 'react-native-webview';

import VoiceAgent from '../voice_agent/components/VoiceAgent';
import { ELEVENLABS_API_KEY, VOICE_AGENT_ID } from '@env';

// Add debug logging to see what we're getting
console.log('Raw env variables:', {
  ELEVENLABS_API_KEY,
  VOICE_AGENT_ID
});

const HomeScreen: React.FC<RootStackScreenProps<'Home'>> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const fetchEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getJournalEntries(user.id);
      setEntries(data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      Alert.alert('Error', 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  const handleSaveQuickEntry = async (text: string) => {
    if (!user || !text.trim()) return;

    try {
      setLoading(true);
      await createJournalEntry(user.id, text);
      
      // After saving, refresh the entries
      await fetchEntries();
      
      // Show success message
      // Alert.alert('Success', 'Entry saved successfully!');
    } catch (error) {
      console.error('Error saving quick entry:', error);
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const webViewContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>
        <style>
          body { margin: 0; padding: 0; background: transparent; }
        </style>
      </head>
      <body>
        <elevenlabs-convai agent-id="oTK8ymbC4uIs5K9kUQJb"></elevenlabs-convai>
      </body>
    </html>
  `;

  useEffect(() => {
    fetchEntries();
  }, [user]);

  return (
    <GradientBackground variant="primary" intensity={0.2}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.email?.split('@')[0] || 'there'}!
          </Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        
        <Card elevated glass style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Your Health Journal</Text>
          <Text style={styles.welcomeText}>
            Track your daily health journey with voice or text notes, and get AI-powered insights.
          </Text>
          <QuickEntryForm
            onSave={handleSaveQuickEntry}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Entries</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Journal')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading && entries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.loadingText}>Loading entries...</Text>
          </Card>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => navigation.navigate('JournalEntry', { entry })}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              You don't have any journal entries yet. Create your first entry to get started!
            </Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.aiFloatingButton}>
        <VoiceAgent 
          apiKey={String(ELEVENLABS_API_KEY)}
          agentId={String(VOICE_AGENT_ID)}
        />
      </View>

      <View style={styles.floatingButton}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('JournalCreate')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* AI Modal */}
      <Modal
        visible={showAIModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAIModal(false)}
            >
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
            <WebView
              source={{ html: webViewContent }}
              style={styles.webview}
              originWhitelist={['*']}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              mixedContentMode="always"
              allowsProtectedMedia={true}
              androidHardwareAccelerationDisabled={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234, 236, 239, 0.4)',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
  },
  profileButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  welcomeCard: {
    marginBottom: 24,
    marginTop: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 20,
    lineHeight: 22,
  },
  newEntryButton: {
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.darkGray,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  aiFloatingButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
  },
  aiButton: {
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 10,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;