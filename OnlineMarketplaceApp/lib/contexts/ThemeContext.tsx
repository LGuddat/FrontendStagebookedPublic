import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme, websiteThemes } from '../constants/Theme';
import { useWebsite } from './WebsiteContext';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setThemeId: (id: number) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  setThemeId: () => {},
  toggleColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [currentTheme, setCurrentTheme] = useState<Theme>(isDark ? darkTheme : lightTheme);
  const { selectedWebsite } = useWebsite();

  // Update theme when system color scheme changes
  useEffect(() => {
    if (!selectedWebsite?.template_id) {
      setIsDark(systemColorScheme === 'dark');
      setCurrentTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
    }
  }, [systemColorScheme, selectedWebsite?.template_id]);

  // Update theme when selected website changes
  useEffect(() => {
    if (selectedWebsite?.template_id) {
      const websiteTheme = websiteThemes[selectedWebsite.template_id];
      if (websiteTheme) {
        setCurrentTheme(websiteTheme);
        setIsDark(selectedWebsite.template_id === 2 || selectedWebsite.template_id === 4 || selectedWebsite.template_id === 6);
      }
    }
  }, [selectedWebsite?.template_id]);

  const setThemeId = (id: number) => {
    const newTheme = websiteThemes[id];
    if (newTheme) {
      setCurrentTheme(newTheme);
      setIsDark(id === 2 || id === 4 || id === 6);
    }
  };

  const toggleColorScheme = () => {
    if (!selectedWebsite?.template_id) {
      setIsDark(!isDark);
      setCurrentTheme(!isDark ? darkTheme : lightTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDark,
        setThemeId,
        toggleColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider; 