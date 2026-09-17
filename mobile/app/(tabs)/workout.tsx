/**
 * WorkoutScreen (FP-017..020, MOB-112).
 * Day ribbon + workout card list + start CTA + rest timer + medical survey link.
 */
import { useState, useCallback } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Dumbbell } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { mockUserService } from '@/services/mockUserService';
import { ToastService } from '@/components/ui/Toast';
import { Card, Chip, Button } from '@/components/ui';
import { WorkoutItem, RestTimer, MedicalSurvey } from '@/features/workout';
import type { Exercise } from '@/types';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const SAMPLE_WORKOUT: Exercise[] = [
  { id: 'w-1', name: 'Push-up', sets: 4, reps: 12, rest: 60, calories: 50 },
  { id: 'w-2', name: 'Squat', sets: 4, reps: 15, rest: 60, calories: 70 },
  { id: 'w-3', name: 'Plank', sets: 3, reps: 1, rest: 45, calories: 30 },
  { id: 'w-4', name: 'Lunge', sets: 3, reps: 12, rest: 60, calories: 55 },
];

export default function WorkoutScreen() {
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const [day, setDay] = useState<string>('T2');
  const [completed, setCompleted] = useState<string[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const handleStart = useCallback(async () => {
    if (!user) return;
    setStartedAt(Date.now());
    ToastService.show({ message: 'Bắt đầu buổi tập. Cố lên!', tone: 'success' });
  }, [user]);

  const handleFinish = useCallback(async () => {
    if (!user || !startedAt) return;
    const minutes = Math.round((Date.now() - startedAt) / 60000);
    const burned = Math.round((minutes / 30) * 250);
    await mockUserService.saveUser({
      ...user,
      caloriesBurned: user.caloriesBurned + burned,
      workoutHistory: [
        ...user.workoutHistory,
        {
          id: `wh-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          day,
          durationMin: minutes,
          caloriesBurned: burned,
          exercises: SAMPLE_WORKOUT.length,
        },
      ],
    });
    setStartedAt(null);
    setCompleted([]);
    await refresh();
    ToastService.show({ message: `Hoàn thành! Đốt ${burned} kcal trong ${minutes} phút.`, tone: 'achievement' });
  }, [user, startedAt, day, refresh]);

  if (!user) return null;
  const hasPlan = user.profile.trainingDays.includes(day);

  if (showSurvey) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
          <Button label="Quay lại" variant="ghost" size="sm" onPress={() => setShowSurvey(false)} />
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>Khảo sát y tế</Text>
        </View>
        <MedicalSurvey
          defaultConditions={user.medicalConditions ?? []}
          defaultNotes={user.medicalNotes ?? ''}
          onSubmit={async ({ conditions, notes }) => {
            await mockUserService.saveUser({
              ...user,
              medicalConditions: conditions,
              medicalNotes: notes,
            });
            await refresh();
            setShowSurvey(false);
            ToastService.show({ message: 'Đã lưu khảo sát y tế.', tone: 'success' });
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 24, fontWeight: '800' }}>Tập luyện</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {WEEKDAYS.map((d) => (
            <Chip key={d} label={d} selected={d === day} onPress={() => setDay(d)} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Calendar color={resolveColor(theme, 'primary')} size={18} />
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{day}</Text>
          </View>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
            Khung giờ: {user.profile.trainingTime}
          </Text>
        </Card>

        {!hasPlan ? (
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Ngày nghỉ</Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
              Hôm nay không có kế hoạch tập. Bạn có thể tập nhẹ hoặc nghỉ ngơi.
            </Text>
          </Card>
        ) : (
          <>
            {SAMPLE_WORKOUT.map((w, idx) => (
              <WorkoutItem
                key={w.id}
                exercise={w}
                index={idx}
                onToggleComplete={() => {
                  setCompleted((arr) => (arr.includes(w.id) ? arr.filter((x) => x !== w.id) : [...arr, w.id]));
                }}
              />
            ))}
            {startedAt && <RestTimer initialSeconds={60} />}
            {!startedAt ? (
              <Button label="Bắt đầu tập" variant="primary" fullWidth onPress={handleStart} />
            ) : (
              <Button
                label={`Hoàn thành (${completed.length}/${SAMPLE_WORKOUT.length})`}
                variant="primary"
                fullWidth
                onPress={handleFinish}
              />
            )}
          </>
        )}

        <Button label="Khảo sát y tế" variant="secondary" fullWidth onPress={() => setShowSurvey(true)} />
        <Button label="Xem lịch sử tập" variant="ghost" fullWidth onPress={() => router.push('/(modals)/history')} />
      </ScrollView>
    </SafeAreaView>
  );
}
