import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authAPI, mockAuthAPI, testAPI } from '../services/api';
import { DEBUG, API_URL } from '../config';

// Debug logger
const log = (message, data) => {
  if (DEBUG) {
    console.log(`[Auth] ${message}`, data || '');
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [serverConnected, setServerConnected] = useState(null);

  // Test server connection on startup
  useEffect(() => {
    const testConnection = async () => {
      try {
        log('Testing server connection...');
        await testAPI.testConnection();
        log('Server connection successful');
        setServerConnected(true);
      } catch (error) {
        log('Server connection failed:', error);
        setServerConnected(false);
        
        // Show alert about server connection issue
        Alert.alert(
          'Server Connection Issue',
          `Unable to connect to the server at ${API_URL}. Some features may not work properly.\n\n` +
          'If you\'re using a local server, make sure it\'s running and accessible from your device.\n\n' +
          'Error: ' + error.message,
          [{ text: 'OK' }]
        );
      }
    };
    
    testConnection();
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        log('Checking for stored auth data...');
        
        // Check if we have a token and user data
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
          log('Found stored auth data');
          
          // Parse user data
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          log('User loaded from storage:', parsedUser);
        } else {
          log('No stored auth data found');
        }
      } catch (error) {
        log('Error bootstrapping auth:', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      log('Login attempt:', { username });
      
      let response;
      
      // Use mock API if server is not connected
      if (!serverConnected) {
        log('Using mock API for login (server not connected)');
        response = await mockAuthAPI.login(username, password);
      } else {
        response = await authAPI.login(username, password);
      }
      
      log('Login response:', response);
      
      if (response.success) {
        // Store token and user data
        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
        }
        
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        // Update state
        setUser(response.user);
        return true;
      } else {
        setAuthError(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      log('Login error:', error);
      setAuthError(error.message || 'Network request failed. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      log('Register attempt:', { username, email });
      
      let response;
      
      // Use mock API if server is not connected
      if (!serverConnected) {
        log('Using mock API for register (server not connected)');
        response = await mockAuthAPI.register(username, email, password);
      } else {
        response = await authAPI.register(username, email, password);
      }
      
      log('Register response:', response);
      
      if (response.success) {
        // Store token and user data
        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
        }
        
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        // Update state
        setUser(response.user);
        return true;
      } else {
        setAuthError(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      log('Register error:', error);
      setAuthError(error.message || 'Network request failed. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      log('Logging out...');
      
      // Clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Update state
      setUser(null);
      
      log('Logout successful');
      return true;
    } catch (error) {
      log('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        serverConnected,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);