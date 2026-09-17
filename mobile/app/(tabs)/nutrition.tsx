/**
 * NutritionScreen (FP-014..016, MOB-111).
 * Segmented: Quet mon | Thuc don.
 * Phase 2: tab skeleton + UI bindings, scan chua co (mock stub).
 */
import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Scan, ListChecks } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Chip, Button, ProgressBar } from '@/components/ui';
import { defaultMacroTargets, calculateBmr, calculateTdee, ageFromBirthday } from '@/utils/bmi';

type Segment = 'scan' | 'plan';

export default function NutritionScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [segment, setSegment] = useState<Segment>('scan');

  if (!user) return null;

  const age = ageFromBirthday(user.profile.birthday);
  const bmr = calculateBmr(user.profile.weight, user.profile.height, age, user.profile.gender);
  const tdee = calculateTdee(bmr, 'moderate');
  const targets = defaultMacroTargets(tdee, 'maintain');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 24, fontWeight: '800' }}>Dinh dưỡng</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Quét món" selected={segment === 'scan'} onPress={() => setSegment('scan')} iconLeft={<Scan size={14} color={resolveColor(theme, 'onPrimaryContainer')} />} />
          <Chip label="Thực đơn" selected={segment === 'plan'} onPress={() => setSegment('plan')} iconLeft={<ListChecks size={14} color={resolveColor(theme, 'onPrimaryContainer')} />} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}>
        {segment === 'scan' && (
          <>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Quét món ăn</Text>
              <View
                style={{
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: resolveColor(theme, 'surfaceContainerLow),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: resolveColor(theme, 'outlineVariant'),
                  borderStyle: 'dashed',
                }}
              >
                <Scan color={resolveColor(theme, 'primary')} size={48} />
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 8 }}>
                  (Demo: không có camera thật)
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button label="Chụp ảnh" variant="secondary" size="sm" fullWidth onPress={() => { /* TODO phase 3 */ }} />
                <Button label="Tải lên" variant="secondary" size="sm" fullWidth onPress={() => { /* TODO phase 3 */ }} />
              </View>
            </Card>

            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Mục tiêu ngày</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                <ProgressBar tone="primary" label="Calories" caption={`${user.caloriesConsumed} / ${targets.calories} kcal`} progress={user.caloriesConsumed / targets.calories} />
                <ProgressBar tone="primary" label="Protein" caption={`${Math.round(targets.protein * 0.5)} / ${targets.protein} g`} progress={0.5} />
                <ProgressBar tone="secondary" label="Carb" caption={`${Math.round(targets.carbs * 0.6)} / ${targets.carbs} g`} progress={0.6} />
                <ProgressBar tone="primary" label="Fat" caption={`${Math.round(targets.fat * 0.4)} / ${targets.fat} g`} progress={0.4} />
              </View>
            </Card>
          </>
        )}

        {segment === 'plan' && (
          <>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Thực đơn hôm nay</Text>
              {['Sáng', 'Trưa', 'Tối'].map((meal) => (
                <View key={meal} style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: resolveColor(theme, 'outlineVariant') }}>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '600' }}>{meal}</Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
                    (Demo) Cháo yến mạch — 350 kcal
                  </Text>
                </View>
              ))}
            </Card>

            <Card variant="flat">
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, textAlign: 'center' }}>
                Tính năng AI đề xuất thay thế bữa ăn sẽ có ở Phase 3.
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
