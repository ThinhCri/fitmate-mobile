/**
 * GlassCard — card co glass effect (BlurView + tint overlay).
 *
 * DEC-025 (2026-09-18): chi dung cho 1-2 vi tri hero (Floating tab bar, hero
 * card tren Homepage). KHONG bien moi component thanh kinh.
 *
 *  - BlurView intensity 20-25 (Android fallback: surface dac + border + shadow).
 *  - Tint white opacity 60-70% (giong surfaceContainerLowest nhung trong hon).
 *  - Border 1dp outlineVariant + shadow nhe.
 *  - Padding mac dinh = lg (16dp).
 *
 * Neu BlurView khong ho tro (web, luc dau), fallback ve surface dac.
 */
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { ReactNode } from 'react';

export interface GlassCardProps {
  children: ReactNode;
  /** Tint cua glass: 'light' = trang mo, 'extraLight' = trang mo hon. */
  tint?: 'light' | 'extraLight' | 'default';
  /** Padding (mac dinh lg=16). */
  padding?: number;
  /** Border radius (mac dinh lg=16). */
  radius?: number;
  /** Custom style override. */
  style?: object;
}

export function GlassCard({
  children,
  tint = 'light',
  padding = 16,
  radius = 16,
  style,
}: GlassCardProps) {
  const theme = useTheme();

  // Android BlurView hoat dong; mac dinh su dung.
  const useBlur = Platform.OS !== 'web';
  const baseColor = resolveColor(theme, 'glassSurface');
  const borderColor = resolveColor(theme, 'outlineVariant');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: useBlur ? 'transparent' : `${baseColor}F2`, // F2 = 95% opacity fallback
          borderColor,
          borderRadius: radius,
          padding,
          ...theme.tokens.elevation.level2,
        },
        style,
      ]}
    >
      {useBlur ? (
        <BlurView
          intensity={22}
          tint={tint}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      ) : null}
      {/* Tint overlay de tang do "trang" cho glass (giam transparency) */}
      {useBlur ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              backgroundColor: baseColor,
              opacity: 0.55,
            },
          ]}
        />
      ) : null}
      <View style={{ position: 'relative' }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
