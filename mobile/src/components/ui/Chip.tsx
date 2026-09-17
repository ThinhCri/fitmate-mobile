/**
 * Chip primitive — filter / suggestion / input chip.
 * Variants: unselected | selected | disabled.
 */
import { Pressable, Text, type PressableProps } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface ChipProps extends Omit<PressableProps, 'children'> {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  tone?: 'neutral' | 'warm' | 'achievement';
}

export function Chip({
  label,
  selected = false,
  disabled = false,
  iconLeft,
  tone = 'neutral',
  ...rest
}: ChipProps) {
  const theme = useTheme();

  let bgKey: keyof typeof theme.tokens.palette;
  let fgKey: keyof typeof theme.tokens.palette;
  let borderKey: keyof typeof theme.tokens.palette | null;

  if (disabled) {
    bgKey = 'surfaceContainerLowest'; fgKey = 'onSurfaceDisabled'; borderKey = 'outlineVariant';
  } else if (selected) {
    if (tone === 'warm') {
      bgKey = 'secondaryContainer'; fgKey = 'onSecondaryContainer'; borderKey = null;
    } else if (tone === 'achievement') {
      bgKey = 'tertiaryContainer'; fgKey = 'onTertiaryContainer'; borderKey = null;
    } else {
      bgKey = 'primaryContainer'; fgKey = 'onPrimaryContainer'; borderKey = null;
    }
  } else {
    bgKey = 'surfaceContainerLowest'; fgKey = 'onSurfaceVariant'; borderKey = 'outlineVariant';
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      style={({ pressed }) => ({
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: resolveColor(theme, bgKey),
        borderWidth: borderKey ? 1 : 0,
        borderColor: borderKey ? resolveColor(theme, borderKey) : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: pressed ? theme.tokens.opacity.pressed : 1,
      })}
      {...rest}
    >
      {iconLeft}
      <Text style={{ color: resolveColor(theme, fgKey), fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
