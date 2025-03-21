import { API_URL, DEBUG } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Debug logger
const log = (message, data) => {
  if (DEBUG) {
    console.log(`[API] ${message}`, data || '');
  }
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  log(`Response status: ${response.status} ${response.statusText}`);
  
  try {
    // Try to parse as JSON first
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      log('Response JSON:', json);
      
      if (!response.ok) {
        throw new Error(json.message || `HTTP error! status: ${response.status}`);
      }
      
      return json;
    } else {
      // Not JSON, get as text
      const text = await response.text();
      log('Response Text:', text);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Try to parse text as JSON anyway (some servers send JSON with wrong content-type)
      try {
        return JSON.parse(text);
      } catch (e) {
        // Return a simple success response if not JSON
        return { success: true, message: text };
      }
    }
  } catch (error) {
    log('Error handling response:', error);
    throw error;
  }
};

// Helper function for making fetch requests with error handling
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  log(`Fetching ${options.method || 'GET'} ${url}`);
  log('Request options:', options);
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    log('Fetch error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    
    // Provide more helpful error messages for common network issues
    if (error.message.includes('Network request failed')) {
      throw new Error(
        'Network request failed. Please check your internet connection and ensure the server is accessible.\n\n' +
        `Server URL: ${API_URL}\n` +
        'If you\'re using a local server, make sure it\'s running and accessible from your device.'
      );
    }
    
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (username, password) => {
    try {
      log('Login attempt:', { username });
      
      // For testing - create a direct URL to test connectivity
      const testUrl = `${API_URL}/api/login.php`;
      log('Testing connectivity to:', testUrl);
      
      // Create form data
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      // Log form data for debugging
      log('Form data:', {
        username,
        password: '********' // Don't log actual password
      });
      
      const response = await fetchWithTimeout(
        testUrl,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      log('Login error:', error);
      throw error;
    }
  },
  
  register: async (username, email, password) => {
    try {
      log('Register attempt:', { username, email });
      
      // Create form data
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('confirm_password', password);
      
      // Log form data for debugging
      log('Form data:', {
        username,
        email,
        password: '********' // Don't log actual password
      });
      
      const response = await fetchWithTimeout(
        `${API_URL}/api/register.php`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      log('Register error:', error);
      throw error;
    }
  },
  
  // Other methods remain the same...
};

// Mock API for testing when server is unavailable
export const mockAuthAPI = {
  login: async (username, password) => {
    log('MOCK LOGIN:', { username });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === 'test' && password === 'password') {
      return {
        success: true,
        token: 'mock-token-12345',
        user: {
          id: 1,
          username: 'test',
          email: 'test@example.com',
          role: 'user'
        }
      };
    } else {
      throw new Error('Invalid username or password');
    }
  },
  
  register: async (username, email, password) => {
    log('MOCK REGISTER:', { username, email });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      token: 'mock-token-12345',
      user: {
        id: 2,
        username,
        email,
        role: 'user'
      }
    };
  }
};

// Export the mock API for testing
export const testAPI = {
  testConnection: async () => {
    try {
      log('Testing connection to server...');
      
      const response = await fetchWithTimeout(
        `${API_URL}/api/test.php`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        },
        5000 // 5 second timeout
      );
      
      return await handleResponse(response);
    } catch (error) {
      log('Connection test error:', error);
      throw error;
    }
  }
};