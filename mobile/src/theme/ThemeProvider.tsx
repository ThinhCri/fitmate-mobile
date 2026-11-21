/**
 * ThemeProvider — supplies tokens + semantic colors via React Context.
 * Supports switching between Classic Light (default) and Dark Gym Obsidian.
 */
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokens, type Tokens, type PaletteKey } from './tokens';
import { semanticColors } from './semantic';
import type { SemanticColors } from './types';
import { setAppTheme, currentThemeMode, ThemeMode } from './designTokens';

export const THEME_STORAGE_KEY = '@fitmate_theme_mode';

export interface Theme {
  tokens: Tokens;
  colors: SemanticColors;
  isDark: boolean;
  themeMode: ThemeMode;
  themeKey: string;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const defaultTheme: Theme = {
  tokens,
  colors: semanticColors,
  isDark: false,
  themeMode: 'light',
  themeKey: 'theme-light-0',
  setThemeMode: async () => {},
};

const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  children: ReactNode;
  value?: Theme;
}

export function ThemeProvider({ children, value }: ThemeProviderProps) {
  const [themeMode, setModeState] = useState<ThemeMode>(currentThemeMode);
  const [themeKey, setThemeKey] = useState<string>(`theme-${currentThemeMode}`);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (!active) return;
        const mode: ThemeMode = saved === 'dark' ? 'dark' : 'light';
        if (mode !== currentThemeMode) {
          setAppTheme(mode);
          setModeState(mode);
          setThemeKey(`theme-${mode}-${Date.now()}`);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSetThemeMode = async (mode: ThemeMode) => {
    setAppTheme(mode);
    setModeState(mode);
    setThemeKey(`theme-${mode}-${Date.now()}`);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  };

  const contextValue: Theme = value ?? {
    tokens,
    colors: semanticColors,
    isDark: themeMode === 'dark',
    themeMode,
    themeKey,
    setThemeMode: handleSetThemeMode,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * Helper: resolve a color key to its raw palette hex value.
 */
export function resolveColor(theme: { tokens: Tokens; colors: SemanticColors }, key: keyof SemanticColors | PaletteKey): string {
  const palette = theme.tokens.palette as Record<string, string>;
  // First try: the key itself is a palette key
  if (key in palette) {
    return palette[key as string] ?? '#000000';
  }
  // Second try: the key is a semantic role -> lookup its palette binding
  const colors = theme.colors as unknown as Record<string, unknown>;
  const maybePaletteKey = colors[key as string];
  if (typeof maybePaletteKey === 'string' && maybePaletteKey in palette) {
    return palette[maybePaletteKey] ?? '#000000';
  }
  return '#000000';
}
