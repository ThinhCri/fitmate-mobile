/**
 * AppointmentsScreen (MOB-114, FP-022/023).
 * Phase 2 skeleton: list appointment theo thang, group theo ngay.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import type { Appointment } from '@/types';
import { Card, Button, Chip } from '@/components/ui';
import { formatDate } from '@/utils/format';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [month, setMonth] = useState(new Date());

  if (!user) return null;
  const items = user.appointments;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Lịch hẹn</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          hitSlop={12}
        >
          <ChevronLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>
          Tháng {month.getMonth() + 1}/{month.getFullYear()}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          hitSlop={12}
        >
          <ChevronRight color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {items.length === 0 ? (
          <Card variant="default">
            <View style={{ alignItems: 'center', padding: 24, gap: 8 }}>
              <Calendar color={resolveColor(theme, 'onSurfaceVariant')} size={48} />
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>Chưa có lịch hẹn nào.</Text>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, textAlign: 'center' }}>
                Đặt lịch với PT để bắt đầu tập luyện.
              </Text>
              <Button label="Tìm PT" variant="primary" onPress={() => router.push('/(tabs)/marketplace')} />
            </View>
          </Card>
        ) : (
          items.map((apt: Appointment) => (
            <Card key={apt.id} variant="default">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>
                    {formatDate(apt.date)} • {apt.timeSlot}
                  </Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
                    {user.profile.isPt ? `HV: ${apt.memberEmail}` : `PT: ${apt.ptEmail}`}
                  </Text>
                </View>
                <Chip
                  label={apt.status === 'confirmed' ? 'Đã xác nhận' : apt.status === 'pending' ? 'Chờ' : apt.status}
                  tone={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : 'neutral'}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
