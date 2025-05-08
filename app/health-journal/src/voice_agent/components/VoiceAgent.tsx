import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import Colors from '../../constants/Colors';

interface VoiceAgentProps {
  apiKey: string;
  agentId: string;
}

const VoiceAgent = memo(({ apiKey, agentId }: VoiceAgentProps) => {
  const { isListening, startListening, stopListening } = useVoiceAgent({
    apiKey,
    agentId
  });

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isListening ? Colors.error : Colors.primary }
      ]}
      onPress={handlePress}
    >
      <Ionicons 
        name={isListening ? "mic-off" : "mic"} 
        size={24} 
        color="#fff" 
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default VoiceAgent; 