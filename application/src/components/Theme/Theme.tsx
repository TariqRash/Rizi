'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useState, useContext, createContext, useEffect } from 'react';
import { createThemeFromConfig } from './ThemeRegistry';
import { createTheme } from '@mui/material/styles';
import { useI18n } from 'context/I18nContext';

interface ThemeModeContextProps {
  mode: 'light' | 'dark';
  toggleMode: () => void;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
}
const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

/**
 * Custom hook to access the theme mode context.
 */
export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

/**
 * Provides the Material UI theme and color mode context to the application.
 */
export default function MaterialThemeProvider({ children }: { children: React.ReactNode }) {
  const { direction } = useI18n();
  const [mode, setMode] = useState<'light' | 'dark'>('light'); // Always start with 'light' for SSR
  const [currentTheme, setCurrentTheme] = useState('modernize'); // Default theme
  const [theme, setTheme] = useState(() => {
    // Create a basic fallback theme for SSR
    return createTheme({
      palette: { mode: 'light', primary: { main: '#0061EB' } },
      cssVariables: true,
      direction,
    });
  });

  // On mount, sync with localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
      const storedTheme = localStorage.getItem('currentTheme') || 'modernize';

      if (storedMode && storedMode !== mode) setMode(storedMode);
      if (storedTheme !== currentTheme) setCurrentTheme(storedTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const newTheme = createThemeFromConfig(currentTheme, mode, { cssVariables: true, direction });
      setTheme(newTheme);
    } catch (error) {
      console.warn('Failed to load theme:', error);
      // Keep using the current theme as fallback
    }
  }, [currentTheme, direction, mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSetCurrentTheme = (theme: string) => {
    setCurrentTheme(theme);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
      localStorage.setItem('currentTheme', currentTheme);
    }
  }, [mode, currentTheme]);

  return (
    <ThemeModeContext.Provider
      value={{
        mode,
        toggleMode,
        currentTheme,
        setCurrentTheme: handleSetCurrentTheme,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
