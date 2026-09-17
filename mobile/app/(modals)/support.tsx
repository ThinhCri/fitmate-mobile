/**
 * SupportSheet (MOB-102) — goi y cac chu de ho tro.
 */
import { View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card } from '@/components/ui';

const TOPICS = [
  { title: 'Cách đăng ký tài khoản', desc: 'Hướng dẫn tạo tài khoản hội viên.' },
  { title: 'Đặt lịch với PT', desc: 'Quy trình chọn PT và đặt buổi tập.' },
  { title: 'Quét món ăn', desc: 'Cách dùng tính năng scan calories.' },
  { title: 'Chứng chỉ PT', desc: 'Quy trình xét duyệt chứng chỉ.' },
];

export default function SupportSheet() {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Hỗ trợ</Text>
      </View>
      <View style={{ padding: 16, gap: 12 }}>
        {TOPICS.map((t) => (
          <Card key={t.title} variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{t.title}</Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>{t.desc}</Text>
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
}
