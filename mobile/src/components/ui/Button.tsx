/**
 * Button primitive — phu hop DEC-019/020 interaction roles.
 *
 * Variants:
 *  - primary: filled primary teal (CTA chinh)
 *  - secondary: surfaceContainerLow + outlineVariant border
 *  - tertiary: text only, primary color (ghost link)
 *  - destructive: filled error
 *  - warm: secondaryContainer + onSecondaryContainer (streak warm accent CTA)
 *  - achievement: tertiaryContainer + onTertiaryContainer (achievement CTA)
 *
 * Disabled: bg surfaceContainerLow + label opacity 0.38 (per design-system).
 */
import { Pressable, StyleSheet, Text, View, ActivityIndicator, type PressableProps, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'warm'
  | 'achievement'
  | 'success'
  | 'warning'
  | 'ghost'
  | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const heights = { sm: 36, md: 44, lg: 52 };
  const fontSize = { sm: 14, md: 14, lg: 16 };

  let bgKey: keyof typeof theme.tokens.palette;
  let fgKey: keyof typeof theme.tokens.palette;
  let borderKey: keyof typeof theme.tokens.palette | null = null;

  switch (variant) {
    case 'primary':
      bgKey = 'primary'; fgKey = 'onPrimary'; break;
    case 'secondary':
      bgKey = 'surfaceContainerLow'; fgKey = 'onSurface'; borderKey = 'outlineVariant'; break;
    case 'tertiary':
      bgKey = 'surfaceContainerLowest'; fgKey = 'primary'; break;
    case 'ghost':
      bgKey = 'surfaceContainerLowest'; fgKey = 'onSurface'; break;
    case 'destructive':
      bgKey = 'error'; fgKey = 'onError'; break;
    case 'warm':
      bgKey = 'secondaryContainer'; fgKey = 'onSecondaryContainer'; break;
    case 'achievement':
      bgKey = 'tertiaryContainer'; fgKey = 'onTertiaryContainer'; break;
    case 'success':
      bgKey = 'success'; fgKey = 'onPrimary'; break;
    case 'warning':
      bgKey = 'warning'; fgKey = 'onPrimary'; break;
    case 'neutral':
      bgKey = 'surfaceContainerLowest'; fgKey = 'onSurfaceVariant'; borderKey = 'outlineVariant'; break;
  }

  const bgColor = resolveColor(theme, bgKey);
  const fgColor = resolveColor(theme, fgKey);
  const borderColor = borderKey ? resolveColor(theme, borderKey) : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: heights[size],
          paddingHorizontal: theme.tokens.spacing.xl,
          borderRadius: theme.tokens.radius.full,
          backgroundColor: bgColor,
          borderWidth: borderKey ? 1 : 0,
          borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.tokens.spacing.sm,
          opacity: disabled ? theme.tokens.opacity.disabled : pressed ? theme.tokens.opacity.pressed : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fgColor} />
      ) : (
        <View style={styles.content}>
          {iconLeft}
          <Text style={{ color: fgColor, fontSize: fontSize[size], fontWeight: '600' }}>{label}</Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
