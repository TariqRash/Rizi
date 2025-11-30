import { createTheme, ThemeOptions, PaletteMode } from '@mui/material/styles';

// Import all themes from the themes directory
import { defaultTheme } from './themes/default';
import { minimalistTheme } from './themes/minimalist';
import { modernizeTheme } from './themes/modernize';
import { oceanTheme } from './themes/ocean';
import { skyTheme } from './themes/sky';
// Base theme configurations
export interface BaseThemeConfig {
  name: string;
  displayName: string;
  palette: {
    light: ThemeOptions['palette'];
    dark: ThemeOptions['palette'];
  };
  typography?: ThemeOptions['typography'];
  components?: ThemeOptions['components'];
}

// Simple theme registry - just list all available themes here
export const themeRegistry: Record<string, BaseThemeConfig> = {
  [defaultTheme.name]: defaultTheme,
  [minimalistTheme.name]: minimalistTheme,
  [modernizeTheme.name]: modernizeTheme,
  [oceanTheme.name]: oceanTheme,
  [skyTheme.name]: skyTheme,
};

console.log(
  `🎨 Registered ${Object.keys(themeRegistry).length} themes:`,
  Object.keys(themeRegistry)
);

// Function to create theme with mode
/**
 * Creates a Material UI theme from configuration and mode
 * @param themeName - The name of the theme to create
 * @param mode - The palette mode (light or dark)
 * @param options - Additional theme options (e.g., cssVariables)
 * @returns A Material UI theme instance
 */
export function createThemeFromConfig(
  themeName: string,
  mode: PaletteMode,
  options?: { cssVariables?: boolean; direction?: 'ltr' | 'rtl' }
) {
  const config = themeRegistry[themeName];

  if (!config) {
    console.warn(`Theme '${themeName}' not found. Using fallback theme.`);
    // Create a minimal fallback theme
    return createTheme({
      palette: {
        mode,
        primary: { main: '#0061EB' },
      },
      cssVariables: options?.cssVariables || false,
    });
  }

  const palette = config.palette[mode];

  return createTheme({
    palette,
    typography: config.typography,
    components: config.components,
    cssVariables: options?.cssVariables || false,
    direction: options?.direction,
  });
}

// Get available theme options
/**
 * Gets the list of available themes
 * @returns Array of theme objects with name and display name
 */
export function getAvailableThemes() {
  return Object.values(themeRegistry).map((theme) => ({
    name: theme.name,
    displayName: theme.displayName,
  }));
}
