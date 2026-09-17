/**
 * SupportSheet (MOB-120, FP-033) — goi y cac chu de ho tro + lien he email.
 * Email hien thi + button mo Linking.openURL('mailto:').
 */
import { ScrollView, View, Text, Pressable, Linking, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button } from '@/components/ui';

const TOPICS = [
  { title: 'Cách đăng ký tài khoản', desc: 'Hướng dẫn tạo tài khoản hội viên.' },
  { title: 'Đặt lịch với PT', desc: 'Quy trình chọn PT và đặt buổi tập.' },
  { title: 'Quét món ăn', desc: 'Cách dùng tính năng scan calories.' },
  { title: 'Chứng chỉ PT', desc: 'Quy trình xét duyệt chứng chỉ.' },
];

const SUPPORT_EMAIL = 'support@fitmate.vn';

export default function SupportSheet() {
  const theme = useTheme();

  const openEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Ho%20tro%20Fitmate&body=Chao%20Fitmate,%0D%0A%0D%0AToi%20can%20ho%20tro%20ve...`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Không thể mở email', `Vui lòng gửi thư tới ${SUPPORT_EMAIL} thủ công.`);
      }
    } catch (e) {
      Alert.alert('Lỗi', `Không thể mở ứng dụng email. Liên hệ: ${SUPPORT_EMAIL}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Hỗ trợ</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {TOPICS.map((t) => (
          <Card key={t.title} variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{t.title}</Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>{t.desc}</Text>
          </Card>
        ))}
        <Card variant="highlighted">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: resolveColor(theme, 'primaryContainer'), alignItems: 'center', justifyContent: 'center' }}>
              <Mail color={resolveColor(theme, 'onPrimaryContainer')} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Liên hệ trực tiếp</Text>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{SUPPORT_EMAIL}</Text>
            </View>
          </View>
          <Button label="Gửi email" variant="primary" fullWidth onPress={openEmail} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
