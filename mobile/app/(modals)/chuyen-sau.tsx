/**
 * ChuyenSauScreen (MOB-116, FP-027).
 * View mode + Edit mode.
 * Sua benh nen, di ung (7 chip + custom text), ngay tap, khung gio (dynamic add/remove).
 * Validation: it nhat 1 ngay tap duoc chon khi save.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react-native';
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

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [medical, setMedical] = useState(user?.profile.medicalCondition ?? '');
  const [allergies, setAllergies] = useState<string[]>(user?.profile.allergies ?? []);
  const [customAllergy, setCustomAllergy] = useState('');
  const [days, setDays] = useState<string[]>(user?.profile.trainingDays ?? []);
  const [timeSlots, setTimeSlots] = useState<string[]>(user?.profile.trainingTimes ?? ['18:00', '20:00']);

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    if (arr.includes(v)) setter(arr.filter((x) => x !== v));
    else setter([...arr, v]);
  };

  const addTimeSlot = () => setTimeSlots((prev) => [...prev, '20:00']);
  const removeTimeSlot = (i: number) => setTimeSlots((prev) => prev.filter((_, idx) => idx !== i));
  const updateTimeSlot = (i: number, v: string) =>
    setTimeSlots((prev) => prev.map((t, idx) => (idx === i ? v : t)));

  const onSave = async () => {
    if (!user) return;
    if (days.length === 0) {
      Alert.alert('Thiếu ngày tập', 'Vui lòng chọn ít nhất 1 ngày tập trong tuần.');
      return;
    }
    if (timeSlots.length === 0) {
      Alert.alert('Thiếu khung giờ', 'Vui lòng thêm ít nhất 1 khung giờ.');
      return;
    }
    const sortedSlots = [...timeSlots].sort();
    const updated = {
      ...user,
      profile: {
        ...user.profile,
        medicalCondition: medical,
        allergies,
        trainingDays: days,
        trainingTime: sortedSlots.length >= 2 ? `${sortedSlots[0]} - ${sortedSlots[sortedSlots.length - 1]}` : sortedSlots[0] ?? '',
        trainingTimes: sortedSlots,
        allergySurveyDone: true,
      },
    };
    await mockUserService.saveUser(updated);
    await refresh();
    setMode('view');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700', flex: 1 }}>Hồ sơ chuyên sâu</Text>
        {mode === 'view' ? (
          <Pressable onPress={() => setMode('edit')} hitSlop={8}>
            <Pencil color={resolveColor(theme, 'primary')} size={20} />
          </Pressable>
        ) : (
          <Pressable onPress={() => setMode('view')} hitSlop={8}>
            <Text style={{ color: resolveColor(theme, 'primary'), fontSize: 14, fontWeight: '700' }}>Hủy</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {mode === 'view' ? (
          <>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Bệnh nền</Text>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14 }}>{user.profile.medicalCondition || 'Không có'}</Text>
            </Card>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Dị ứng</Text>
              {user.profile.allergies.length === 0 ? (
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>Không có</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {user.profile.allergies.map((a) => (
                    <Chip key={a} label={a} selected />
                  ))}
                </View>
              )}
            </Card>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Ngày tập</Text>
              {user.profile.trainingDays.length === 0 ? (
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>Chưa chọn</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {user.profile.trainingDays.map((d) => (
                    <Chip key={d} label={d} selected />
                  ))}
                </View>
              )}
            </Card>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Khung giờ</Text>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14 }}>{user.profile.trainingTime || 'Chưa đặt'}</Text>
            </Card>
          </>
        ) : (
          <>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Bệnh nền</Text>
              <Input label="Mô tả bệnh nền (nếu có)" value={medical} onChangeText={setMedical} placeholder="Ví dụ: hen suyễn, tiểu đường..." multiline />
            </Card>

            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Dị ứng</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ALLERGY_OPTIONS.map((a) => (
                  <Chip key={a} label={a} selected={allergies.includes(a)} onPress={() => toggle(allergies, a, setAllergies)} />
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Input label="Dị ứng khác" value={customAllergy} onChangeText={setCustomAllergy} placeholder="VD: Mèo" />
                </View>
                <Button label="+ Thêm" variant="secondary" size="md" onPress={() => {
                  const v = customAllergy.trim();
                  if (v && !allergies.includes(v)) setAllergies([...allergies, v]);
                  setCustomAllergy('');
                }} />
              </View>
              {allergies.filter((a) => !ALLERGY_OPTIONS.includes(a)).length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {allergies.filter((a) => !ALLERGY_OPTIONS.includes(a)).map((a) => (
                    <Chip key={a} label={`${a} ✕`} onPress={() => setAllergies(allergies.filter((x) => x !== a))} />
                  ))}
                </View>
              )}
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
              {timeSlots.map((slot, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Input label={i === 0 ? 'Slot' : ''} value={slot} onChangeText={(v) => updateTimeSlot(i, v)} placeholder="VD: 18:00" />
                  </View>
                  {timeSlots.length > 1 && (
                    <Pressable onPress={() => removeTimeSlot(i)} hitSlop={8} style={{ marginTop: i === 0 ? 18 : 0 }}>
                      <Trash2 color={resolveColor(theme, 'error')} size={18} />
                    </Pressable>
                  )}
                </View>
              ))}
              <Button label="+ Thêm slot" variant="tertiary" size="sm" onPress={addTimeSlot} iconLeft={<Plus size={14} color={resolveColor(theme, 'onSurface')} />} />
            </Card>

            <Button label="Lưu" variant="primary" fullWidth onPress={onSave} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
