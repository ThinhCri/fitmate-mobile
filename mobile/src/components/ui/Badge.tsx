/**
 * Badge — text + tone. Required text per design-system.
 * Tones: error | warning | info | success | neutral.
 */
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface BadgeProps {
  text: string;
  tone?: 'error' | 'warning' | 'info' | 'success' | 'neutral';
}

export function Badge({ text, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();

  let bgKey: keyof typeof theme.tokens.palette;
  let fgKey: keyof typeof theme.tokens.palette;

  switch (tone) {
    case 'error':
      bgKey = 'errorContainer'; fgKey = 'onErrorContainer'; break;
    case 'warning':
      bgKey = 'warning'; fgKey = 'onPrimary'; break; // text on warning filled - use white
    case 'info':
      bgKey = 'info'; fgKey = 'onPrimary'; break;
    case 'success':
      bgKey = 'success'; fgKey = 'onPrimary'; break;
    case 'neutral':
    default:
      bgKey = 'surfaceContainerHigh'; fgKey = 'onSurfaceVariant'; break;
  }

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: resolveColor(theme, bgKey),
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: resolveColor(theme, fgKey), fontSize: 11, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}
