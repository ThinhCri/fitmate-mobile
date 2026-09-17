/**
 * Avatar — initials fallback khi URL null.
 * Sizes: 32 / 40 / 56 / 80 / 100.
 */
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: 32 | 40 | 56 | 80 | 100;
  tone?: 'neutral' | 'primary' | 'secondary' | 'tertiary';
  border?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

function colorFromName(name: string): string {
  // Pastel hues cho fallback neu khong dung tone prop.
  const hues = [200, 30, 160, 100, 280, 340];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `hsl(${hues[h % hues.length]}, 60%, 80%)`;
}

export function Avatar({ name, uri, size = 56, tone = 'neutral', border = false }: AvatarProps) {
  const theme = useTheme();
  const bgKey: keyof typeof theme.tokens.palette =
    tone === 'primary' ? 'primaryContainer'
    : tone === 'secondary' ? 'secondaryContainer'
    : tone === 'tertiary' ? 'tertiaryContainer'
    : 'surfaceContainerLow';

  const fallbackBg = colorFromName(name);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: uri ? resolveColor(theme, bgKey) : fallbackBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: border ? 2 : 0,
        borderColor: resolveColor(theme, tone === 'tertiary' ? 'tertiary' : tone === 'primary' ? 'primary' : 'surfaceContainerLowest'),
      }}
    >
      <Text style={{ color: '#1A1A1F', fontSize: size * 0.4, fontWeight: '700' }}>{initials(name)}</Text>
    </View>
  );
}
