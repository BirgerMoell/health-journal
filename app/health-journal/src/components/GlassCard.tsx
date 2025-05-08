import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import Colors from '../constants/Colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  elevated = false,
  intensity = 'medium',
}) => {
  const getOpacity = () => {
    switch (intensity) {
      case 'light': return 0.6;
      case 'medium': return 0.75;
      case 'heavy': return 0.85;
      default: return 0.75;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: `rgba(255, 255, 255, ${getOpacity()})` },
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
    // Gives a slightly blurred look on supported platforms
    backdropFilter: 'blur(10px)',
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default GlassCard;