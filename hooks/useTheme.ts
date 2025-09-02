import { useColorScheme } from 'react-native';

export type Theme = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    income: string;
    expense: string;
  };
  isDark: boolean;
};

const lightTheme: Theme = {
  colors: {
    primary: '#1E40AF',
    secondary: '#059669',
    accent: '#EA580C',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    income: '#10B981',
    expense: '#EF4444',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#FB923C',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    income: '#34D399',
    expense: '#F87171',
  },
  isDark: true,
};

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}