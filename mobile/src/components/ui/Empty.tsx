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
  /** alias for subtitle */
  description?: string;
  /** alias for subtitle */
  message?: string;
  ctaLabel?: string;
  /** alias for ctaLabel */
  actionLabel?: string;
  onCta?: () => void;
  /** alias for onCta */
  onAction?: () => void;
}

export function Empty({ icon, title, subtitle, description, message, ctaLabel, actionLabel, onCta, onAction }: EmptyProps) {
  const theme = useTheme();
  const resolvedSubtitle = subtitle ?? description ?? message;
  const resolvedCtaLabel = ctaLabel ?? actionLabel;
  const resolvedOnCta = onCta ?? onAction;
  return (
    <View style={{ alignItems: 'center', padding: theme.tokens.spacing['3xl'], gap: theme.tokens.spacing.md }}>
      <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
        {title}
      </Text>
      {resolvedSubtitle && (
        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center' }}>
          {resolvedSubtitle}
        </Text>
      )}
      {resolvedCtaLabel && resolvedOnCta && <Button label={resolvedCtaLabel} variant="primary" onPress={resolvedOnCta} />}
    </View>
  );
}
