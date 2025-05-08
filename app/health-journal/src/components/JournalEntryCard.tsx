import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  StyleProp,
  ViewStyle
} from 'react-native';
import Card from './Card';
import { JournalEntry } from '../services/journal';
import Colors from '../constants/Colors';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onPress,
  style,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Truncate text if it's too long
  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      style={style}
    >
      <Card elevated glass>
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
          {entry.mood && (
            <View style={styles.moodContainer}>
              <Text style={styles.mood}>{entry.mood}</Text>
            </View>
          )}
        </View>
        <Text style={styles.text}>
          {truncateText(entry.text)}
        </Text>
        {entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {entry.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  moodContainer: {
    backgroundColor: 'rgba(74, 125, 252, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mood: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.black,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: 'rgba(74, 125, 252, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default JournalEntryCard;