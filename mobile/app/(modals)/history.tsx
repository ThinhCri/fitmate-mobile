/**
 * HistoryScreen (FP-018 history view).
 * Workout sessions + cheat meal days + weight changes.
 */
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Dumbbell, Salad, TrendingDown } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button, Empty } from '@/components/ui';

export default function HistoryScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  if (!user) return null;

  const sorted = [...user.workoutHistory].sort((a, b) => b.date.localeCompare(a.date));
  const totalSessions = sorted.length;
  const totalMin = sorted.reduce((s, w) => s + w.durationMin, 0);
  const totalKcal = sorted.reduce((s, w) => s + w.caloriesBurned, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Button label="Quay lại" variant="ghost" size="sm" onPress={() => router.back()} iconLeft={<ChevronLeft size={14} color="#1A1A1F" />} />
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Lịch sử tập</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Tổng quan</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>Buổi tập</Text>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 20, fontWeight: '800' }}>{totalSessions}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>Tổng phút</Text>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 20, fontWeight: '800' }}>{totalMin}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>Đốt (kcal)</Text>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 20, fontWeight: '800' }}>{totalKcal}</Text>
            </View>
          </View>
        </Card>

        {sorted.length === 0 ? (
          <Empty title="Chưa có buổi tập" message="Hoàn thành buổi tập đầu tiên để lưu lịch sử." icon={<Dumbbell color={resolveColor(theme, 'outline')} size={32} />} />
        ) : (
          sorted.map((s) => (
            <Card key={s.id} variant="default">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Dumbbell color={resolveColor(theme, 'primary')} size={18} />
                <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{s.day} • {s.date}</Text>
              </View>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
                {s.exercises} bài tập • {s.durationMin} phút • đốt {s.caloriesBurned} kcal
              </Text>
            </Card>
          ))
        )}

        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Salad color={resolveColor(theme, 'success')} size={18} />
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Lịch sử cheat meal</Text>
          </View>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
            Tính năng đang phát triển. Dữ liệu sẽ xuất hiện sau khi bạn ghi nhận cheat meal trong Nutrition.
          </Text>
        </Card>

        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TrendingDown color={resolveColor(theme, 'info')} size={18} />
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Lịch sử cân nặng</Text>
          </View>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
            Cân nặng hiện tại: {user.profile.weight} kg.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
