import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS, DEBUG, API_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const { login, loading, authError, serverConnected } = useAuth();
  
  const [username, setUsername] = useState(DEBUG ? 'test' : '');
  const [password, setPassword] = useState(DEBUG ? 'password' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Show error alert if auth error exists
  useEffect(() => {
    if (authError) {
      Alert.alert('Login Error', authError);
    }
  }, [authError]);
  
  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(username, password);
      
      if (!success && !authError) {
        // If no specific error was set but login failed
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoContainer}
            >
              <Ionicons name="flame" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Dragon Forums</Text>
            <Text style={styles.subtitle}>Login to your account</Text>
            
            {/* Server connection status */}
            {serverConnected === false && (
              <View style={styles.serverWarning}>
                <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
                <Text style={styles.serverWarningText}>
                  Server connection issue. Using offline mode.
                </Text>
              </View>
            )}
            
            {DEBUG && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>API URL: {API_URL}</Text>
                <Text style={styles.debugText}>
                  Server: {serverConnected === null ? 'Checking...' : 
                          serverConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isSubmitting || loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {isSubmitting || loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Info', 'Please contact an administrator to reset your password.')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={isSubmitting || loading}
            >
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  serverWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  serverWarningText: {
    color: COLORS.warning,
    fontSize: 12,
    marginLeft: 4,
  },
  debugInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    width: '100%',
  },
  debugText: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    paddingHorizontal: 8,
  },
  passwordToggle: {
    padding: 10,
  },
  loginButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    marginRight: 4,
  },
  registerText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});