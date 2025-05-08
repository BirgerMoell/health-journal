import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import JournalScreen from '../screens/JournalScreen';
import JournalEntryScreen from '../screens/JournalEntryScreen';
import JournalCreateScreen from '../screens/JournalCreateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      >
        {user ? (
          // Authenticated user flows
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Health Journal' }}
            />
            <Stack.Screen 
              name="Journal" 
              component={JournalScreen} 
              options={{ title: 'Journal Entries' }}
            />
            <Stack.Screen 
              name="JournalEntry" 
              component={JournalEntryScreen} 
              options={{ title: 'Journal Entry' }}
            />
            <Stack.Screen 
              name="JournalCreate" 
              component={JournalCreateScreen} 
              options={{ title: 'New Entry' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Profile' }}
            />
          </>
        ) : (
          // Authentication flows
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen} 
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}