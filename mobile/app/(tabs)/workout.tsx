/**
 * WorkoutScreen (FP-017..020, MOB-112).
 * Day ribbon + workout card list + start CTA.
 * Phase 2 skeleton.
 */
import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Dumbbell } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Chip, Button } from '@/components/ui';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface WorkoutItem {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  calories: number;
}

const SAMPLE_WORKOUT: WorkoutItem[] = [
  { id: 'w-1', name: 'Push-up', sets: 4, reps: 12, rest: 60, calories: 50 },
  { id: 'w-2', name: 'Squat', sets: 4, reps: 15, rest: 60, calories: 70 },
  { id: 'w-3', name: 'Plank', sets: 3, reps: 1, rest: 45, calories: 30 },
];

export default function WorkoutScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [day, setDay] = useState<string>('T2');

  if (!user) return null;
  const hasPlan = user.profile.trainingDays.includes(day);

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

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}>
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
            {SAMPLE_WORKOUT.map((w) => (
              <Card key={w.id} variant="default">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: resolveColor(theme, 'primaryContainer'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Dumbbell color={resolveColor(theme, 'onPrimaryContainer')} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{w.name}</Text>
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 2 }}>
                      {w.sets} hiệp × {w.reps} reps • Nghỉ {w.rest}s • ~{w.calories} kcal
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
            <Button label="Bắt đầu tập" variant="primary" fullWidth onPress={() => { /* TODO phase 3 */ }} />
          </>
        )}

        <Button label="Khảo sát y tế" variant="secondary" fullWidth onPress={() => { /* TODO phase 3 */ }} />
      </ScrollView>
    </SafeAreaView>
  );
}
