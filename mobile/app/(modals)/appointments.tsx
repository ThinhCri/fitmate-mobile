/**
 * AppointmentsScreen (MOB-114, FP-022/023).
 * - Calendar grid 7 cot x 5/6 hang (FP-022).
 * - Day cell click → modal day detail list (FP-022).
 * - PT view: filter chi appointment co ptName = self (FP-022).
 * - Member view: tat ca (FP-022).
 * - PT actions: Xac nhan / Tu choi / Da hoan thanh / Tre / Xoa (FP-022).
 * - Member actions: Huy yeu cau / Huy da hen / Xoa lich su (FP-022).
 */
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, X, Check, Trash2, Clock } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import type { Appointment } from '@/types';
import { Card, Button, Chip, Empty } from '@/components/ui';
import { formatDate } from '@/utils/format';

type StatusKey = 'pending' | 'confirmed' | 'completed' | 'late' | 'cancelled';

const STATUS_LABEL: Record<StatusKey, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Đã hoàn thành',
  late: 'Trễ',
  cancelled: 'Đã hủy',
};

const STATUS_TONE: Record<StatusKey, 'warning' | 'success' | 'neutral' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'success',
  late: 'destructive',
  cancelled: 'neutral',
};

export default function AppointmentsScreen() {
  const { user, saveUser } = useAuth();
  const theme = useTheme();
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // role filter
  const items = useMemo(() => {
    if (!user) return [];
    if (user.profile.isPt) {
      // PT view: chi appointment co ptEmail = self.email
      return user.appointments.filter((a) => a.ptEmail === user.email);
    }
    return user.appointments;
  }, [user]);

  if (!user) return null;

  // Calendar grid
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const leadingBlanks = (firstWeekday + 6) % 7; // make Mon = 0
  const cells: ({ day: number; date: Date } | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: new Date(year, m, d) });

  const appointmentsByDay = (date: Date) => {
    const ymd = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return items.filter((a) => {
      const ad = new Date(a.date);
      return `${ad.getFullYear()}-${ad.getMonth()}-${ad.getDate()}` === ymd;
    });
  };

  const today = new Date();
  const todayYmd = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const selectedDayItems = selectedDay ? appointmentsByDay(selectedDay) : [];

  const updateStatus = async (id: string, status: StatusKey) => {
    const next = user.appointments.map((a) => (a.id === id ? { ...a, status } : a));
    await saveUser({ appointments: next });
  };

  const deleteAppointment = async (id: string) => {
    await saveUser({ appointments: user.appointments.filter((a) => a.id !== id) });
    if (selectedDayItems.length === 1) setSelectedDay(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Lịch hẹn</Text>
        <View style={{ flex: 1 }} />
        {user.profile.isPt && (
          <Chip label="Chế độ PT" tone="achievement" />
        )}
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
        {/* Calendar grid */}
        <Card variant="default">
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
              <View key={d} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, fontWeight: '600' }}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((cell, idx) => {
              if (!cell) {
                return <View key={`b-${idx}`} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }} />;
              }
              const dayItems = appointmentsByDay(cell.date);
              const isToday = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}` === todayYmd;
              const hasItems = dayItems.length > 0;
              const isPast = cell.date < today && !isToday;
              return (
                <Pressable
                  key={`d-${cell.day}`}
                  onPress={() => setSelectedDay(cell.date)}
                  style={{
                    width: `${100 / 7}%`,
                    aspectRatio: 1,
                    padding: 2,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isToday
                        ? resolveColor(theme, 'primaryContainer')
                        : hasItems
                        ? resolveColor(theme, 'secondaryContainer')
                        : 'transparent',
                      borderWidth: 1,
                      borderColor: isToday
                        ? resolveColor(theme, 'primary')
                        : hasItems
                        ? resolveColor(theme, 'secondary')
                        : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: isToday
                          ? resolveColor(theme, 'onPrimaryContainer')
                          : hasItems
                          ? resolveColor(theme, 'onSecondaryContainer')
                          : isPast
                          ? resolveColor(theme, 'outline')
                          : resolveColor(theme, 'onSurface'),
                        fontSize: 13,
                        fontWeight: hasItems || isToday ? '800' : '500',
                      }}
                    >
                      {cell.day}
                    </Text>
                    {hasItems && (
                      <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                        {dayItems.slice(0, 3).map((a, i) => (
                          <View
                            key={i}
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor:
                                a.status === 'confirmed'
                                  ? resolveColor(theme, 'primary')
                                  : a.status === 'pending'
                                  ? resolveColor(theme, 'secondary')
                                  : a.status === 'late'
                                  ? resolveColor(theme, 'error')
                                  : resolveColor(theme, 'outline'),
                            }}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {items.length === 0 ? (
          <Empty
            icon={<Calendar color={resolveColor(theme, 'onSurfaceVariant')} size={48} />}
            title="Chưa có lịch hẹn nào."
            description="Đặt lịch với PT để bắt đầu tập luyện."
            actionLabel="Tìm PT"
            onAction={() => router.push('/(tabs)/marketplace')}
          />
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>
              Tất cả lịch ({items.length})
            </Text>
            {items
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((apt) => (
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
                      label={STATUS_LABEL[apt.status as StatusKey] || apt.status}
                      tone={STATUS_TONE[apt.status as StatusKey] || 'neutral'}
                    />
                  </View>
                </Card>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Day detail modal */}
      <Modal visible={selectedDay !== null} transparent animationType="fade" onRequestClose={() => setSelectedDay(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={() => setSelectedDay(null)}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: resolveColor(theme, 'surface'),
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 20,
                  gap: 12,
                  maxHeight: '80%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Calendar color={resolveColor(theme, 'primary')} size={20} />
                  <Text style={{ flex: 1, color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>
                    {selectedDay && formatDate(selectedDay.toISOString())}
                  </Text>
                  <Pressable onPress={() => setSelectedDay(null)} hitSlop={12}>
                    <X color={resolveColor(theme, 'onSurface')} size={20} />
                  </Pressable>
                </View>

                {selectedDayItems.length === 0 ? (
                  <Card variant="flat">
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13, textAlign: 'center' }}>
                      Không có lịch hẹn trong ngày này.
                    </Text>
                  </Card>
                ) : (
                  selectedDayItems.map((apt) => (
                    <Card key={apt.id} variant="default">
                      <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Clock color={resolveColor(theme, 'primary')} size={14} />
                          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>
                            {apt.timeSlot}
                          </Text>
                          <View style={{ flex: 1 }} />
                          <Chip
                            label={STATUS_LABEL[apt.status as StatusKey] || apt.status}
                            tone={STATUS_TONE[apt.status as StatusKey] || 'neutral'}
                          />
                        </View>
                        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
                          {user.profile.isPt ? `HV: ${apt.memberEmail}` : `PT: ${apt.ptEmail}`}
                        </Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          {user.profile.isPt ? (
                            <>
                              {apt.status === 'pending' && (
                                <>
                                  <Button label="Xác nhận" variant="primary" size="sm" onPress={() => updateStatus(apt.id, 'confirmed')} iconLeft={<Check size={12} color={resolveColor(theme, 'onPrimary')} />} />
                                  <Button label="Từ chối" variant="destructive" size="sm" onPress={() => updateStatus(apt.id, 'cancelled')} />
                                </>
                              )}
                              {apt.status === 'confirmed' && (
                                <>
                                  <Button label="Hoàn thành" variant="primary" size="sm" onPress={() => updateStatus(apt.id, 'completed')} />
                                  <Button label="Trễ" variant="destructive" size="sm" onPress={() => updateStatus(apt.id, 'late')} />
                                </>
                              )}
                              <Button label="Xóa" variant="ghost" size="sm" onPress={() => deleteAppointment(apt.id)} iconLeft={<Trash2 size={12} color={resolveColor(theme, 'onSurface')} />} />
                            </>
                          ) : (
                            <>
                              {apt.status === 'pending' && (
                                <Button label="Hủy yêu cầu" variant="destructive" size="sm" onPress={() => updateStatus(apt.id, 'cancelled')} />
                              )}
                              {apt.status === 'confirmed' && (
                                <Button label="Hủy đã hẹn" variant="destructive" size="sm" onPress={() => updateStatus(apt.id, 'cancelled')} />
                              )}
                              {(apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'late') && (
                                <Button label="Xóa lịch sử" variant="ghost" size="sm" onPress={() => deleteAppointment(apt.id)} iconLeft={<Trash2 size={12} color={resolveColor(theme, 'onSurface')} />} />
                              )}
                            </>
                          )}
                        </View>
                      </View>
                    </Card>
                  ))
                )}
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
