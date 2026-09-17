/**
 * VIPSheet (MOB-102) — tertiaryContainer (achievement tier).
 */
import { View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Gem } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button } from '@/components/ui';

export default function VipSheet() {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>VIP</Text>
      </View>
      <View style={{ padding: 16, gap: 16 }}>
        <Card variant="highlighted">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: resolveColor(theme, 'tertiaryContainer'),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gem color={resolveColor(theme, 'tertiary')} size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Fitmate VIP</Text>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
                Mở khóa tính năng nâng cao.
              </Text>
            </View>
          </View>
        </Card>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '600' }}>Quyền lợi (demo):</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13, marginTop: 4 }}>• AI Companion không giới hạn</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13, marginTop: 4 }}>• Bài viết knowledge cao cấp</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13, marginTop: 4 }}>• Ưu đãi đặt lịch PT</Text>
        </Card>
        <Button label="Nâng cấp (demo)" variant="achievement" fullWidth onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
