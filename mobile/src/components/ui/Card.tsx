/**
 * Card primitive — 3 sub-types: default / highlighted / flat.
 * Background = surfaceContainerLowest (card), border = outlineVariant (default 1dp).
 */
import { View, type ViewProps, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export type CardVariant = 'default' | 'highlighted' | 'selected' | 'flat';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ variant = 'default', children, style, ...rest }: CardProps) {
  const theme = useTheme();
  let bgKey: keyof typeof theme.tokens.palette;
  let borderKey: keyof typeof theme.tokens.palette | null;
  let borderWidth = 1;

  switch (variant) {
    case 'highlighted':
      bgKey = 'surfaceContainerLowest'; borderKey = 'primary'; break;
    case 'selected':
      bgKey = 'surfaceContainer'; borderKey = 'primary'; break;
    case 'flat':
      bgKey = 'surfaceContainerLow'; borderKey = null; borderWidth = 0; break;
    case 'default':
    default:
      bgKey = 'surfaceContainerLowest'; borderKey = 'outlineVariant'; break;
  }

  return (
    <View
      style={[
        {
          backgroundColor: resolveColor(theme, bgKey),
          borderWidth,
          borderColor: borderKey ? resolveColor(theme, borderKey) : 'transparent',
          borderRadius: theme.tokens.radius.lg,
          padding: theme.tokens.spacing.lg,
          gap: theme.tokens.spacing.sm,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
