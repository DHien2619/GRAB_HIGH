import { Platform } from 'react-native';

export const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL || 
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export const FOOD_API_URL = process.env.EXPO_PUBLIC_FOOD_API_URL || 
  (Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001');

export const COLORS = {
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#dcfce7',
  secondary: '#f97316',
  secondaryLight: '#fff7ed',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  white: '#ffffff',
};
