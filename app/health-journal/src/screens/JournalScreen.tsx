import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RootStackScreenProps } from '../navigation/types';
import JournalEntryCard from '../components/JournalEntryCard';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { getJournalEntries, JournalEntry } from '../services/journal';
import Colors from '../constants/Colors';

const JournalScreen: React.FC<RootStackScreenProps<'Journal'>> = ({ navigation }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    if (!user) return;
    
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

  useEffect(() => {
    fetchEntries();
  }, [user]);

  if (loading) {
    return (
      <GradientBackground variant="calm">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading journal entries...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="calm" intensity={0.2}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal Entries</Text>
        </View>
        
        <FlatList
          data={entries}
          renderItem={({ item }) => (
            <JournalEntryCard
              entry={item}
              onPress={() => navigation.navigate('JournalEntry', { entry: item })}
              style={styles.entryCard}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card glass elevated style={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  You don't have any journal entries yet.
                </Text>
                <Text style={styles.emptySubtext}>
                  Start journaling to track your health journey.
                </Text>
              </View>
            </Card>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234, 236, 239, 0.4)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  entryCard: {
    marginBottom: 12,
  },
  emptyCard: {
    marginTop: 24,
    padding: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default JournalScreen;