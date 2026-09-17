import { Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export default function MarketplaceScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface'), padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Marketplace (MOB-113 — Phase 2)</Text>
    </View>
  );
}
