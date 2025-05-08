import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import Colors from '../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  elevated = false,
  glass = false 
}) => {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        glass && styles.glass,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(234, 236, 239, 0.6)',
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(10px)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  }
});

export default Card;