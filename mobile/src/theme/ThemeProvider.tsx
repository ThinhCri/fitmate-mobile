/**
 * ThemeProvider — supplies tokens + semantic colors via React Context.
 *
 * Phase 1 ships only light theme. When (if) dark theme is added later, change
 * `defaultTheme` to a switch reading `useColorScheme()` or a user toggle.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { tokens, type Tokens, type PaletteKey } from './tokens';
import { semanticColors } from './semantic';
import type { SemanticColors } from './types';

export interface Theme {
  tokens: Tokens;
  colors: SemanticColors;
  isDark: false; // reserved for future dark theme; phase UI is light-only
}

const defaultTheme: Theme = {
  tokens,
  colors: semanticColors,
  isDark: false,
};

const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  children: ReactNode;
  /** Reserved for future theme switching. Ignored in phase UI. */
  value?: Theme;
}

export function ThemeProvider({ children, value }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={value ?? defaultTheme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * Helper: resolve a color key to its raw palette hex value.
 * Accepts either a semantic role (e.g. 'primary') or a palette key (e.g. 'onSurface').
 * Example: `resolveColor(theme, 'primary')` → '#0F766E'.
 */
export function resolveColor(theme: Theme, key: keyof SemanticColors | PaletteKey): string {
  const palette = theme.tokens.palette as Record<string, string>;
  // First try: the key itself is a palette key
  if (key in palette) {
    return palette[key as string] ?? '#000000';
  }
  // Second try: the key is a semantic role → lookup its palette binding
  const colors = theme.colors as unknown as Record<string, unknown>;
  const maybePaletteKey = colors[key as string];
  if (typeof maybePaletteKey === 'string' && maybePaletteKey in palette) {
    return palette[maybePaletteKey] ?? '#000000';
  }
  return '#000000';
}
