import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'calm' | 'energy' | 'soothing' | 'morning';
  style?: ViewStyle;
  intensity?: number; // 0-1, controls opacity
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'primary',
  style,
  intensity = 0.15, // Subtle by default
}) => {
  const gradientColors = Colors.gradients[variant] || Colors.gradients.primary;
  
  // Apply opacity to make it subtle
  const startColor = `${gradientColors[0]}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
  const endColor = `${gradientColors[1]}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
  
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[startColor, endColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default GradientBackground;