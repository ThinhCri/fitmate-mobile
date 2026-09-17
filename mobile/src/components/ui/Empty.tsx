/**
 * Empty state — icon + title + subtitle + optional CTA.
 */
import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Button } from './Button';

export interface EmptyProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function Empty({ icon, title, subtitle, ctaLabel, onCta }: EmptyProps) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: theme.tokens.spacing['3xl'], gap: theme.tokens.spacing.md }}>
      <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center' }}>
          {subtitle}
        </Text>
      )}
      {ctaLabel && onCta && <Button label={ctaLabel} variant="primary" onPress={onCta} />}
    </View>
  );
}
