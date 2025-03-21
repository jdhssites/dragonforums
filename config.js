// App configuration
export const APP_NAME = 'Dragon Forums';
export const APP_VERSION = '1.0.0';

// API configuration
// IMPORTANT: Replace this with your actual server URL
// For local development with Expo, use your computer's IP address on your local network
// For example: 'http://192.168.1.100' 
// If you're using a hosted server, use the full URL: 'https://your-domain.com'
export const API_URL = 'http://localhost:80'; // Use this for Android emulator pointing to localhost
// export const API_URL = 'http://localhost:80'; // Use this for iOS simulator
// export const API_URL = 'https://dragonforums.infinityfreeapp.com'; // Use this for production

// Debug mode - set to true to see detailed logs
export const DEBUG = true;

// UI Colors
export const COLORS = {
  primary: '#b91c1c',
  primaryDark: '#7f1d1d',
  primaryLight: '#ef4444',
  
  background: '#0f0f0f',
  backgroundSecondary: '#1a1a1a',
  
  text: '#f3f4f6',
  textMuted: '#9ca3af',
  
  border: '#2a2a2a',
  
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// App settings
export const APP_SETTINGS = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  postCharacterLimit: 1000,
  commentCharacterLimit: 500,
};