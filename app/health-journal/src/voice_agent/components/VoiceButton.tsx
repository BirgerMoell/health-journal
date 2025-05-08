import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoiceButtonProps {
  onPress: () => void;
  isActive: boolean;
  isListening: boolean;
}

// Change to default export
const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onPress, 
  isActive, 
  isListening 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    if (isListening) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isListening]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };

  const getIconName = () => {
    if (!isActive) return "mic-off-outline";
    if (isListening) return "radio";
    return "mic-outline";
  };

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: Animated.multiply(pulseAnim, pressAnim) }] }
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          isActive && styles.activeButton,
          isListening && styles.listeningButton,
          !isActive && styles.inactiveButton,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isActive}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={getIconName()} 
          size={24} 
          color={isActive ? "#fff" : "#999"} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  listeningButton: {
    backgroundColor: '#FF3B30',
  },
  inactiveButton: {
    backgroundColor: '#E0E0E0',
  },
});

export default VoiceButton; 