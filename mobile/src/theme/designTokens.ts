/**
 * Fitmate Mobile Design Tokens
 * Source: Stitch visual specs + system export
 * Supports dynamic switching between Classic Light theme (default) and Dark Gym Obsidian theme.
 */
import { palette, lightPalette, darkPalette, tokens } from './tokens';

export type ThemeMode = 'light' | 'dark';

export const lightColors = {
  primary: '#F43F5E',
  primaryDark: '#E11D48',
  primaryLight: '#FFE4E6',
  secondary: '#3B82F6',
  secondaryLight: '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  success: '#10B981',
  successLight: '#E6F7F0',
  white: '#FFFFFF',
  black: '#000000',
  backdrop: 'rgba(15, 23, 42, 0.4)',
} as const;

export const darkColors = {
  primary: '#F43F5E',
  primaryDark: '#E11D48',
  primaryLight: '#2D1520',
  secondary: '#3B82F6',
  secondaryLight: '#1E293B',
  background: '#090D16',
  surface: '#111827',
  surfaceSubtle: '#1E293B',
  border: '#1F293D',
  borderSubtle: '#182234',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  danger: '#EF4444',
  dangerLight: '#3B1818',
  warning: '#F59E0B',
  warningLight: '#332308',
  info: '#3B82F6',
  infoLight: '#122038',
  success: '#10B981',
  successLight: '#0B2B20',
  white: '#FFFFFF',
  black: '#000000',
  backdrop: 'rgba(0, 0, 0, 0.75)',
} as const;

export type ColorTokens = {
  [K in keyof typeof lightColors]: string;
};

// Start with light mode as default (giao diện cũ)
export let currentThemeMode: ThemeMode = 'light';

export const colors: ColorTokens = { ...lightColors };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export function getTypography(c: ColorTokens) {
  return {
    display: {
      fontSize: 26,
      fontWeight: '700' as const,
      lineHeight: 34,
      color: c.textPrimary,
    },
    title1: {
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 26,
      color: c.textPrimary,
    },
    title2: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
      color: c.textPrimary,
    },
    title3: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
      color: c.textPrimary,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      color: c.textPrimary,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      color: c.textPrimary,
    },
    bodyBold: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
      color: c.textPrimary,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      color: c.textSecondary,
    },
    captionMedium: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      color: c.textSecondary,
    },
    badge: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 14,
    },
  };
}

export const typography = getTypography(colors);

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

// Registry for registered stylesheets to dynamically retarget styles when theme changes
const styleSheetRegistry = new Set<Record<string, any>>();

export function registerStyleSheetForTheming(sheet: any) {
  if (sheet && typeof sheet === 'object') {
    styleSheetRegistry.add(sheet);
  }
}

export function applyThemeToStyleSheets(targetMode: ThemeMode) {
  for (const sheet of styleSheetRegistry) {
    if (!sheet || typeof sheet !== 'object') continue;
    for (const ruleKey of Object.keys(sheet)) {
      const rule = sheet[ruleKey];
      if (!rule || typeof rule !== 'object') continue;
      for (const prop of Object.keys(rule)) {
        const val = rule[prop];
        if (typeof val === 'string') {
          const lower = val.toLowerCase();
          if (targetMode === 'dark') {
            if (prop === 'backgroundColor') {
              if (lower === '#f8fafc') rule[prop] = '#090D16';
              else if (lower === '#ffffff') rule[prop] = '#111827';
              else if (lower === '#f1f5f9') rule[prop] = '#1E293B';
              else if (lower === '#eff6ff') rule[prop] = '#1E293B';
              else if (lower === '#ffe4e6') rule[prop] = '#2D1520';
              else if (lower === '#fee2e2') rule[prop] = '#3B1818';
              else if (lower === '#fef3c7') rule[prop] = '#332308';
              else if (lower === '#e6f7f0') rule[prop] = '#0B2B20';
            } else if (prop === 'color') {
              if (lower === '#0f172a') rule[prop] = '#F8FAFC';
              else if (lower === '#475569') rule[prop] = '#94A3B8';
              else if (lower === '#94a3b8') rule[prop] = '#64748B';
            } else if (prop.toLowerCase().includes('border') || prop.toLowerCase().includes('color')) {
              if (lower === '#e2e8f0') rule[prop] = '#1F293D';
              else if (lower === '#f1f5f9') rule[prop] = '#182234';
            }
          } else {
            // targetMode === 'light'
            if (prop === 'backgroundColor') {
              if (lower === '#090d16') rule[prop] = '#F8FAFC';
              else if (lower === '#111827') rule[prop] = '#FFFFFF';
              else if (lower === '#1e293b') rule[prop] = '#F1F5F9';
              else if (lower === '#2d1520') rule[prop] = '#FFE4E6';
              else if (lower === '#3b1818') rule[prop] = '#FEE2E2';
              else if (lower === '#332308') rule[prop] = '#FEF3C7';
              else if (lower === '#0b2b20') rule[prop] = '#E6F7F0';
              else if (lower === '#122038') rule[prop] = '#EFF6FF';
            } else if (prop === 'color') {
              if (lower === '#f8fafc') rule[prop] = '#0F172A';
              else if (lower === '#94a3b8') rule[prop] = '#475569';
              else if (lower === '#64748b') rule[prop] = '#94A3B8';
            } else if (prop.toLowerCase().includes('border') || prop.toLowerCase().includes('color')) {
              if (lower === '#1f293d') rule[prop] = '#E2E8F0';
              else if (lower === '#182234') rule[prop] = '#F1F5F9';
            }
          }
        }
      }
    }
  }
}

type ThemeListener = (mode: ThemeMode) => void;
const themeListeners = new Set<ThemeListener>();

export function subscribeThemeChange(listener: ThemeListener): () => void {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

export function setAppTheme(mode: ThemeMode) {
  currentThemeMode = mode;
  const targetColors = mode === 'dark' ? darkColors : lightColors;
  Object.assign(colors, targetColors);
  Object.assign(typography, getTypography(colors));
  Object.assign(palette, mode === 'dark' ? darkPalette : lightPalette);
  if (tokens && tokens.palette) {
    Object.assign(tokens.palette, palette);
  }
  applyThemeToStyleSheets(mode);
  for (const listener of themeListeners) {
    try {
      listener(mode);
    } catch {}
  }
}

// Default is light mode
setAppTheme('light');

export const designTokens = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
};

export default designTokens;
