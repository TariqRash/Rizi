'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  LightMode,
  DarkMode,
  Brightness6 as ThemeIcon,
} from '@mui/icons-material';
import { useThemeMode } from './Theme';
import { getAvailableThemes } from './ThemeRegistry';

/**
 * Theme picker component that allows users to select between different themes
 * and toggle between light/dark modes. Responsive design with mobile FAB.
 */
export function ThemePicker() {
  const { mode, toggleMode, currentTheme, setCurrentTheme } = useThemeMode();
  const [availableThemes, setAvailableThemes] = useState<{ name: string; displayName: string }[]>(
    []
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMenuOpen = Boolean(anchorEl);

  // Load available themes on mount
  useEffect(() => {
    try {
      const themes = getAvailableThemes();
      setAvailableThemes(themes);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load available themes:', error);
      }
      // Set a fallback theme list
      setAvailableThemes([
        { name: 'modernize', displayName: 'Modernize' },
        { name: 'minimalist', displayName: 'Minimalist' },
      ]);
    }
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeName: string) => {
    setCurrentTheme(themeName);
    handleMenuClose();
  };

  const handleModeToggle = () => {
    toggleMode();
    handleMenuClose();
  };

  // Mobile version with FAB and Menu
  if (isMobile) {
    return (
      <>
        <Fab
          color="primary"
          size="small"
          onClick={handleMenuOpen}
          aria-label="Select theme"
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1300,
            width: 40,
            height: 40,
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            },
          }}
        >
          <ThemeIcon fontSize="small" />
        </Fab>
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
            },
          }}
        >
          {/* Light/Dark Mode Toggle */}
          <MenuItem
            onClick={handleModeToggle}
            aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          >
            <ListItemIcon>
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </ListItemIcon>
            <ListItemText>Switch to {mode === 'light' ? 'dark' : 'light'} mode</ListItemText>
          </MenuItem>

          <Divider />

          {/* Theme Options */}
          {availableThemes.map((theme) => (
            <MenuItem
              key={theme.name}
              onClick={() => handleThemeSelect(theme.name)}
              selected={currentTheme === theme.name}
              aria-label={`Select ${theme.displayName} theme`}
            >
              <ListItemIcon>
                <PaletteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{theme.displayName}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
  // Desktop version with compact design
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {/* Theme Selector - More compact */}
      <Tooltip title="Change theme">
        <IconButton onClick={handleMenuOpen} color="inherit" size="small" aria-label="Select theme">
          <PaletteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: { mt: 1, minWidth: 180 },
        }}
      >
        {availableThemes.map((theme) => (
          <MenuItem
            key={theme.name}
            onClick={() => handleThemeSelect(theme.name)}
            selected={currentTheme === theme.name}
            aria-label={`Select ${theme.displayName} theme`}
          >
            <ListItemIcon>
              <PaletteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{theme.displayName}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Light/Dark Mode Toggle */}
      <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton
          onClick={toggleMode}
          color="inherit"
          size="small"
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
