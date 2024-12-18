import { Platform } from 'react-native';

export interface Theme {
  backgroundColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  accentBgColor: string;
  surfaceColor: string;
  borderColor: string;
  errorColor: string;
  successColor: string;
  warningColor: string;
  placeholderColor: string;
  inputBgColor: string;
  cardBgColor: string;
  shadowColor: string;
  linkColor: string;
  activeGreen: string;
  inactiveGray: string;
  hoverBgColor: string;
  dividerColor: string;
  dropShadowColor: string;
  // New colors for better contrast
  secondaryTextColor: string;
  buttonOutlineBorderColor: string;
  buttonOutlineTextColor: string;
}

export const lightTheme: Theme = {
  backgroundColor: '#ffffff',
  textColor: '#1a1d1a',
  buttonBgColor: '#ffffff',
  buttonTextColor: '#000000',
  accentBgColor: '#18181b',
  surfaceColor: '#ffffff',
  borderColor: '#e5e7eb',
  errorColor: '#dc2626',
  successColor: '#16a34a',
  warningColor: '#ca8a04',
  placeholderColor: '#71717a',
  inputBgColor: '#f3f4f6',
  cardBgColor: '#ffffff',
  shadowColor: Platform.select({ ios: '#000000', android: '#000000' }) || '#000000',
  linkColor: '#2563eb',
  activeGreen: '#22c55e',
  inactiveGray: '#71717a',
  hoverBgColor: '#f4f4f5',
  dividerColor: '#e5e7eb',
  dropShadowColor: 'rgba(0, 0, 0, 0.1)',
  // New colors for better contrast
  secondaryTextColor: '#4b5563', // Darker gray for better readability
  buttonOutlineBorderColor: '#374151', // Darker border for outline buttons
  buttonOutlineTextColor: '#374151', // Darker text for outline buttons
};

export const darkTheme: Theme = {
  backgroundColor: '#18181b',
  textColor: '#ffffff',
  buttonBgColor: '#27272a',
  buttonTextColor: '#ffffff',
  accentBgColor: '#3f3f46',
  surfaceColor: '#27272a',
  borderColor: '#3f3f46',
  errorColor: '#ef4444',
  successColor: '#22c55e',
  warningColor: '#eab308',
  placeholderColor: '#a1a1aa',
  inputBgColor: '#27272a',
  cardBgColor: '#27272a',
  shadowColor: Platform.select({ ios: '#000000', android: '#000000' }) || '#000000',
  linkColor: '#3b82f6',
  activeGreen: '#22c55e',
  inactiveGray: '#71717a',
  hoverBgColor: '#3f3f46',
  dividerColor: '#3f3f46',
  dropShadowColor: 'rgba(0, 0, 0, 0.2)',
  // New colors for better contrast
  secondaryTextColor: '#d1d5db', // Lighter gray for dark theme
  buttonOutlineBorderColor: '#d1d5db', // Lighter border for dark theme
  buttonOutlineTextColor: '#d1d5db', // Lighter text for dark theme
};

// Website themes matching the web version
export const websiteThemes: { [key: number]: Theme } = {
  1: { // Light theme
    ...lightTheme,
    backgroundColor: '#ffffff',
    accentBgColor: '#F5F5F5',
    textColor: '#282828',
    buttonBgColor: '#eeeeee',
    buttonTextColor: '#000000',
  },
  2: { // Dark theme
    ...darkTheme,
    backgroundColor: '#1b1b1b',
    accentBgColor: '#1f1f1f',
    buttonBgColor: '#282828',
  },
  3: { // Ocean floor
    ...lightTheme,
    backgroundColor: '#FFEFDB',
    accentBgColor: '#79CDCD',
    textColor: '#ffffff',
    buttonBgColor: '#7AC5CD',
    buttonTextColor: '#ffffff',
  },
  4: { // Dark Navy
    ...darkTheme,
    backgroundColor: '#172831',
    accentBgColor: '#2D4957',
    buttonBgColor: '#172831',
  },
  5: { // Candy
    ...lightTheme,
    backgroundColor: '#F8DEF2',
    accentBgColor: '#EFB0D1',
    textColor: '#0E1A15',
    buttonBgColor: '#EA9DC5',
    buttonTextColor: '#0E1A15',
  },
  6: { // Sort & Gul
    ...darkTheme,
    backgroundColor: '#2B2B2B',
    accentBgColor: '#3F3F3F',
    buttonBgColor: '#ECC936',
    buttonTextColor: '#2B2B2B',
  },
  7: { // Ørken
    ...lightTheme,
    backgroundColor: '#F6F3EB',
    accentBgColor: '#E8DAC9',
    textColor: '#1d1d1d',
    buttonBgColor: '#9D6F4D',
    buttonTextColor: '#ffffff',
  },
};

// Common styles that can be reused across components
export const commonStyles = {
  shadow: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
  dropShadow: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
  borderRadius: {
    small: 4,
    medium: 6,
    large: 8,
    xl: 12,
    full: 9999,
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
    },
    h2: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600',
    },
    h3: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600',
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
    },
    button: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
  },
}; 