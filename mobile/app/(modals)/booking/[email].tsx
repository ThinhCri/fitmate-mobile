/**
 * BookingSheet — date picker + 6 time slot.
 * Member dat lich voi PT.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { Card, Button, Chip } from '@/components/ui';

const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00', '19:00', '21:00'];

export default function BookingSheet() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState<string | null>(null);

  const onConfirm = async () => {
    if (!user || !email || !slot) return;
    const newApt = {
      id: `apt-${Date.now()}`,
      date,
      timeSlot: slot,
      ptEmail: email,
      memberEmail: user.email,
      status: 'pending' as const,
      notes: '',
    };
    await mockUserService.saveUser({ ...user, appointments: [...user.appointments, newApt] });
    await mockUserService.updateOtherUser(email, (u) => ({ ...u, appointments: [...u.appointments, newApt] }));
    await refresh();
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Đặt lịch</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Chọn ngày</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{date}</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11, marginTop: 4 }}>
            (Demo: chọn ngày hiện tại. Phase 3 sẽ có date picker.)
          </Text>
        </Card>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Khung giờ</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIME_SLOTS.map((t) => (
              <Chip key={t} label={t} selected={slot === t} onPress={() => setSlot(t)} />
            ))}
          </View>
        </Card>
        <Button label="Xác nhận đặt lịch" variant="primary" fullWidth onPress={onConfirm} disabled={!slot} />
      </ScrollView>
    </SafeAreaView>
  );
}
