/**
 * WorkoutScreen (FP-017..020, MOB-112).
 * Day ribbon + workout card list + start CTA + rest timer + medical survey link.
 */
import { useState, useCallback } from 'react';
import { ScrollView, View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Dumbbell, Sparkles } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { mockUserService } from '@/services/mockUserService';
import { ToastService } from '@/components/ui/Toast';
import { Card, Chip, Button } from '@/components/ui';
import { WorkoutItem, RestTimer, MedicalSurvey } from '@/features/workout';
import { calculateBmi } from '@/utils/bmi';
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>(SAMPLE_WORKOUT);

  const handleStart = useCallback(async () => {
    if (!user) return;
    setStartedAt(Date.now());
    ToastService.show({ message: 'Bắt đầu buổi tập. Cố lên!', tone: 'success' });
  }, [user]);

  /**
   * FP-018 — AI Thích ứng: user nhap prompt (vd "tap nhe", "tap nhieu chan"),
   * AI tinh diem bai tap theo tag, BMI, medical condition swap / giam reps.
   */
  const handleAiAdaptive = useCallback(async () => {
    if (!user) return;
    const promptLower = aiPrompt.toLowerCase();
    // Heuristic scoring theo tag
    const tagBoost: Record<string, number> = {};
    currentWorkout.forEach((ex) => {
      tagBoost[ex.id] = 0;
    });
    if (promptLower.includes('chan') || promptLower.includes('leg')) {
      tagBoost['w-2'] = 4;
      tagBoost['w-4'] = 4;
    }
    if (promptLower.includes('tay') || promptLower.includes('arm') || promptLower.includes('push')) {
      tagBoost['w-1'] = 4;
    }
    if (promptLower.includes('core') || promptLower.includes('bung')) {
      tagBoost['w-3'] = 3;
    }
    if (promptLower.includes('nhe') || promptLower.includes('easy')) {
      currentWorkout.forEach((ex) => {
        tagBoost[ex.id] -= 2;
      });
    }
    const bmi = calculateBmi(user.profile.height, user.profile.weight);
    const medical = user.medicalConditions ?? [];
    const swapReason: string[] = [];
    if (bmi.category === 'overweight' || bmi.category === 'obese') {
      tagBoost['w-3'] = (tagBoost['w-3'] ?? 0) + 2; // plank core
      swapReason.push(`BMI ${bmi.value.toFixed(1)} (${bmi.label})`);
    }
    if (medical.length > 0) {
      swapReason.push(`có điều kiện y tế: ${medical.join(', ')}`);
      tagBoost['w-1'] = (tagBoost['w-1'] ?? 0) + 3; // push-up -> modified
    }
    // Sort by score desc, take top 3
    const sorted = [...currentWorkout].sort((a, b) => (tagBoost[b.id] ?? 0) - (tagBoost[a.id] ?? 0));
    const next = sorted.slice(0, 3).map((ex) => {
      // Reduce reps if easy prompt + medical
      const reduced = medical.length > 0 && (promptLower.includes('nhe') || promptLower.includes('easy'));
      return reduced ? { ...ex, reps: Math.max(1, Math.round(ex.reps * 0.7)) } : ex;
    });
    setCurrentWorkout(next);
    setShowAiSheet(false);
    setAiPrompt('');
    if (swapReason.length > 0) {
      ToastService.show({
        message: `AI đã tối ưu: ${swapReason.join('; ')}.`,
        tone: 'achievement',
      });
    } else {
      ToastService.show({ message: 'AI đã sắp xếp lại bài tập.', tone: 'success' });
    }
  }, [user, aiPrompt, currentWorkout]);

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
            {currentWorkout.map((w, idx) => (
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
                label={`Hoàn thành (${completed.length}/${currentWorkout.length})`}
                variant="primary"
                fullWidth
                onPress={handleFinish}
              />
            )}
            <Button
              label="AI Thích ứng"
              variant="secondary"
              fullWidth
              onPress={() => setShowAiSheet(true)}
            />
          </>
        )}

        <Button label="Khảo sát y tế" variant="secondary" fullWidth onPress={() => setShowSurvey(true)} />
        <Button label="Xem lịch sử tập" variant="ghost" fullWidth onPress={() => router.push('/(modals)/history')} />
      </ScrollView>

      {showAiSheet && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: resolveColor(theme, 'surfaceContainerLowest'),
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 16,
            gap: 12,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles color={resolveColor(theme, 'tertiary')} size={20} />
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>
              AI Thích ứng
            </Text>
          </View>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
            Ví dụ: "tập nhẹ cho người mới", "tập nhiều chân", "tập core"
          </Text>
          <TextInput
            value={aiPrompt}
            onChangeText={setAiPrompt}
            placeholder="Mô tả buổi tập bạn muốn..."
            placeholderTextColor={resolveColor(theme, 'onSurfaceDisabled')}
            style={{
              borderColor: resolveColor(theme, 'outline'),
              borderWidth: 1,
              borderRadius: theme.tokens.radius.md,
              padding: 12,
              color: resolveColor(theme, 'onSurface'),
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            multiline
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Hủy" variant="ghost" fullWidth onPress={() => setShowAiSheet(false)} />
            <Button label="AI sắp xếp" variant="achievement" fullWidth onPress={handleAiAdaptive} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
