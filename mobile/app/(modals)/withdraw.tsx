/**
 * WithdrawSheet (MOB-102 — reward withdraw).
 * Phase 2 skeleton: hien thi reward points, hien nut Rut (mock).
 */
import { View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button } from '@/components/ui';
import { formatVnd } from '@/utils/format';

export default function WithdrawSheet() {
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) return null;
  const value = user.rewardPoints * 1000; // 1 point = 1000 VND (mock)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Rút thưởng</Text>
      </View>
      <View style={{ padding: 16, gap: 16 }}>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>Điểm hiện có</Text>
          <Text style={{ color: resolveColor(theme, 'success'), fontSize: 32, fontWeight: '800' }}>
            {user.rewardPoints} điểm
          </Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
            Tương đương {formatVnd(value)}
          </Text>
        </Card>
        <Button
          label="Rút điểm (demo)"
          variant="primary"
          fullWidth
          onPress={() => router.back()}
        />
        <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11, textAlign: 'center' }}>
          Đây là mô phỏng demo, không có giao dịch thật.
        </Text>
      </View>
    </SafeAreaView>
  );
}
