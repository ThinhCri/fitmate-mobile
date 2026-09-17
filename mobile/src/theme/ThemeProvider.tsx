/**
 * ThemeProvider — supplies tokens + semantic colors via React Context.
 *
 * Phase 1 ships only light theme. When (if) dark theme is added later, change
 * `defaultTheme` to a switch reading `useColorScheme()` or a user toggle.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { tokens, type Tokens } from './tokens';
import { semanticColors, type SemanticColors } from './types';

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
 * Helper: resolve a semantic color key to its palette hex value.
 * Example: `resolveColor(theme, theme.colors.primary)` → '#0F766E'.
 */
export function resolveColor(theme: Theme, key: SemanticColors[keyof SemanticColors]): string {
  return theme.tokens.palette[key];
}
