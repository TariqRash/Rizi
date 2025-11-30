"use client";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { useI18n } from 'context/I18nContext';
import { createThemeFromConfig } from './ThemeRegistry';

/**
 * Static theme provider for public pages (login, signup, landing, etc.)
 *
 * This provider uses a fixed sky light theme without theme switching capabilities.
 * No async loading - the theme is created synchronously to avoid flickering.
 * For protected pages with full theme customization, use the main Theme.tsx provider.
 *
 * Features:
 * - Always uses the 'sky' theme
 * - Always uses 'light' mode
 * - No theme switching UI
 * - No async loading or flickering
 * - Optimized for public-facing pages
 */
export default function PublicThemeProvider({ children }: { children: React.ReactNode }) {
  const { direction } = useI18n();
  const publicTheme = useMemo(
    () => createThemeFromConfig('sky', 'light', { cssVariables: true, direction }),
    [direction]
  );

  return (
    <ThemeProvider theme={publicTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
