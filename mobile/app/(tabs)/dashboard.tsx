/**
 * Placeholder screen — Phase 2 sẽ thay the noi dung day du.
 * Phase 1 chi can Expo Router thay du 5 tab.
 */
import { Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export default function DashboardScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface'), padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Dashboard (MOB-101 — Phase 2)</Text>
    </View>
  );
}
