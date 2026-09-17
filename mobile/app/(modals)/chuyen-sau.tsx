/**
 * ChuyenSauScreen (MOB-116, FP-027).
 * Sua benh nen, di ung, ngay tap, khung gio.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { Card, Button, Chip, Input } from '@/components/ui';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const ALLERGY_OPTIONS = ['Sữa & Lactose', 'Hải sản', 'Đậu phộng', 'Trứng', 'Gluten', 'Đậu nành', 'Hạt'];

export default function ChuyenSauScreen() {
  const { user, refresh } = useAuth();
  const theme = useTheme();

  const [medical, setMedical] = useState(user?.profile.medicalCondition ?? '');
  const [allergies, setAllergies] = useState<string[]>(user?.profile.allergies ?? []);
  const [days, setDays] = useState<string[]>(user?.profile.trainingDays ?? []);
  const [fromTime, setFromTime] = useState('18:00');
  const [toTime, setToTime] = useState('20:00');

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    if (arr.includes(v)) setter(arr.filter((x) => x !== v));
    else setter([...arr, v]);
  };

  const onSave = async () => {
    if (!user) return;
    const updated = {
      ...user,
      profile: {
        ...user.profile,
        medicalCondition: medical,
        allergies,
        trainingDays: days,
        trainingTime: `${fromTime} - ${toTime}`,
        trainingTimes: [fromTime, toTime],
        allergySurveyDone: true,
      },
    };
    await mockUserService.saveUser(updated);
    await refresh();
    router.back();
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Hồ sơ chuyên sâu</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Bệnh nền</Text>
          <Input
            label="Mô tả bệnh nền (nếu có)"
            value={medical}
            onChangeText={setMedical}
            placeholder="Ví dụ: hen suyễn, tiểu đường..."
          />
        </Card>

        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Dị ứng</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALLERGY_OPTIONS.map((a) => (
              <Chip key={a} label={a} selected={allergies.includes(a)} onPress={() => toggle(allergies, a, setAllergies)} />
            ))}
          </View>
        </Card>

        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Ngày tập</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {WEEKDAYS.map((d) => (
              <Chip key={d} label={d} selected={days.includes(d)} onPress={() => toggle(days, d, setDays)} />
            ))}
          </View>
        </Card>

        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Khung giờ</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input label="Từ" value={fromTime} onChangeText={setFromTime} placeholder="18:00" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Đến" value={toTime} onChangeText={setToTime} placeholder="20:00" />
            </View>
          </View>
        </Card>

        <Button label="Lưu" variant="primary" fullWidth onPress={onSave} />
        <Button label="Hủy" variant="tertiary" fullWidth onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
