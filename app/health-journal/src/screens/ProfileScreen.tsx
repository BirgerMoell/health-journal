import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, HealthProfile } from '../context/AuthContext';
import { RootStackScreenProps } from '../navigation/types';
import Button from '../components/Button';
import Card from '../components/Card';
import Colors from '../constants/Colors';

const ProfileScreen: React.FC<RootStackScreenProps<'Profile'>> = ({ navigation }) => {
  const { user, signOut, healthProfile, updateHealthProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [localHealthProfile, setLocalHealthProfile] = useState<HealthProfile>({
    age: '',
    gender: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    lifestyle: ''
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              // Navigation is handled by the AuthContext
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // In a real app, you would persist this setting and apply the theme
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    // In a real app, you would persist this setting and update notification preferences
  };

  const handleOpenSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://example.com/terms');
  };
  
  // Health profile functions
  useEffect(() => {
    // Load health profile from auth context
    setLocalHealthProfile(healthProfile);
  }, [healthProfile]);
  
  const toggleEditProfile = () => {
    if (editingProfile) {
      // If we're currently editing, save changes
      updateHealthProfile(localHealthProfile);
    } else {
      // If we're not editing, start editing with current values
      setLocalHealthProfile(healthProfile);
    }
    setEditingProfile(!editingProfile);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email ? user.email[0].toUpperCase() : '?'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Profile</Text>
            <TouchableOpacity onPress={toggleEditProfile}>
              <Text style={styles.editButton}>
                {editingProfile ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Health Profile Fields */}
          <View style={styles.profileField}>
            <Text style={styles.profileLabel}>Age</Text>
            {editingProfile ? (
              <TextInput
                style={styles.profileInput}
                value={localHealthProfile.age}
                onChangeText={(text) => setLocalHealthProfile({...localHealthProfile, age: text})}
                placeholder="Enter your age"
                keyboardType="number-pad"
              />
            ) : (
              <Text style={styles.profileValue}>{healthProfile.age || 'Not specified'}</Text>
            )}
          </View>
          
          <View style={styles.profileField}>
            <Text style={styles.profileLabel}>Gender</Text>
            {editingProfile ? (
              <TextInput
                style={styles.profileInput}
                value={localHealthProfile.gender}
                onChangeText={(text) => setLocalHealthProfile({...localHealthProfile, gender: text})}
                placeholder="Enter your gender"
              />
            ) : (
              <Text style={styles.profileValue}>{healthProfile.gender || 'Not specified'}</Text>
            )}
          </View>
          
          <View style={styles.profileField}>
            <Text style={styles.profileLabel}>Medical Conditions</Text>
            {editingProfile ? (
              <TextInput
                style={[styles.profileInput, styles.multilineInput]}
                value={localHealthProfile.medicalConditions}
                onChangeText={(text) => setLocalHealthProfile({...localHealthProfile, medicalConditions: text})}
                placeholder="List any medical conditions"
                multiline={true}
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.profileValue}>
                {healthProfile.medicalConditions || 'Not specified'}
              </Text>
            )}
          </View>
          
          <View style={styles.profileField}>
            <Text style={styles.profileLabel}>Medications</Text>
            {editingProfile ? (
              <TextInput
                style={[styles.profileInput, styles.multilineInput]}
                value={localHealthProfile.medications}
                onChangeText={(text) => setLocalHealthProfile({...localHealthProfile, medications: text})}
                placeholder="List any medications"
                multiline={true}
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.profileValue}>
                {healthProfile.medications || 'Not specified'}
              </Text>
            )}
          </View>
          
          <View style={styles.profileField}>
            <Text style={styles.profileLabel}>Allergies</Text>
            {editingProfile ? (
              <TextInput
                style={[styles.profileInput, styles.multilineInput]}
                value={localHealthProfile.allergies}
                onChangeText={(text) => setLocalHealthProfile({...localHealthProfile, allergies: text})}
                placeholder="List any allergies"
                multiline={true}
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.profileValue}>
                {healthProfile.allergies || 'Not specified'}
              </Text>
            )}
          </View>
          
          <View style={styles.profileField}>
            <Text style={styles.profileLabel}>Lifestyle</Text>
            {editingProfile ? (
              <TextInput
                style={[styles.profileInput, styles.multilineInput]}
                value={localHealthProfile.lifestyle}
                onChangeText={(text) => setLocalHealthProfile({...localHealthProfile, lifestyle: text})}
                placeholder="Describe your exercise, diet, etc."
                multiline={true}
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.profileValue}>
                {healthProfile.lifestyle || 'Not specified'}
              </Text>
            )}
          </View>
        </Card>
        
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color="#212529" />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#ddd', true: '#4a7dfc' }}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#212529" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#ddd', true: '#4a7dfc' }}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <TouchableOpacity style={styles.listItem} onPress={handleOpenSupport}>
            <View style={styles.listItemContent}>
              <Ionicons name="help-circle-outline" size={24} color="#212529" />
              <Text style={styles.listItemText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={handleOpenPrivacyPolicy}>
            <View style={styles.listItemContent}>
              <Ionicons name="document-text-outline" size={24} color="#212529" />
              <Text style={styles.listItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={handleOpenTerms}>
            <View style={styles.listItemContent}>
              <Ionicons name="document-outline" size={24} color="#212529" />
              <Text style={styles.listItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            type="danger"
            loading={loading}
            disabled={loading}
          />
        </View>

        <Text style={styles.versionText}>Health Journal v1.0.0</Text>
      </ScrollView>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  profileField: {
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  profileLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: '#212529',
    marginBottom: 6,
  },
  profileValue: {
    color: '#6c757d',
    fontSize: 16,
    lineHeight: 22,
  },
  profileInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a7dfc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#212529',
    marginLeft: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 16,
    color: '#212529',
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#adb5bd',
  },
});

export default ProfileScreen;