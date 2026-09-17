/**
 * Error state — icon + title + message + Retry button.
 */
import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Button } from './Button';

export interface ErrorStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ icon, title, message, onRetry }: ErrorStateProps) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: theme.tokens.spacing['3xl'], gap: theme.tokens.spacing.md }}>
      {icon}
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center' }}>
        {message}
      </Text>
      {onRetry && <Button label="Thử lại" variant="primary" onPress={onRetry} />}
    </View>
  );
}
