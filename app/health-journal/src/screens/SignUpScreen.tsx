import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { RootStackScreenProps } from '../navigation/types';
import Input from '../components/Input';
import Button from '../components/Button';
import { signUp } from '../services/auth';

const { width, height } = Dimensions.get('window');

const SignUpScreen: React.FC<RootStackScreenProps<'SignUp'>> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Use useRef to initialize Animated values once
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide the header for this screen
    navigation.setOptions({ headerShown: false });
  }, [navigation, fadeAnim, slideAnim]);

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(
        'Registration Successful',
        'Please check your email for verification instructions.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Registration Failed',
        'There was an error creating your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/images/health-bg.jpg')}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={[
                  styles.container,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.header}>
                  <LottieView
                    source={require('../assets/animations/health_heart.json')}
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                  />
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>
                    Join Health Journal to start tracking your health journey
                  </Text>
                </View>
                <View style={styles.formContainer}>
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    textContentType="emailAddress"
                    autoComplete="email"
                    style={styles.input}
                    icon="mail"
                  />
                  <Input
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                    textContentType="newPassword"
                    autoComplete="password-new"
                    style={styles.input}
                    icon="lock"
                  />
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                    textContentType="newPassword"
                    autoComplete="password-new"
                    style={styles.input}
                    icon="lock"
                  />
                  <Button
                    title="Sign Up"
                    onPress={handleSignUp}
                    loading={loading}
                    disabled={loading}
                    style={styles.signupButton}
                  />
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      Already have an account?{' '}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Login')}
                      style={styles.loginButton}
                    >
                      <Text style={styles.loginText}>Log In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  lottieAnimation: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: { marginBottom: 16 },
  signupButton: {
    marginTop: 24,
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: '#555555', fontSize: 16 },
  loginButton: { padding: 4 },
  loginText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
});

export default SignUpScreen;
