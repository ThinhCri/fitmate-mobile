/**
 * NutritionScreen (FP-014..016, MOB-111).
 * Segmented: Quet mon | Thuc don.
 * Scan tab (FP-014): image picker (mock) -> 2s scanning animation -> result (name + macros)
 *   -> portion slider 0.5x..2.0x -> quick assign sang/trua/toi -> cap nhat
 *   caloriesConsumed + mealSchedule.
 * Plan tab (FP-015 partial): 7 ngay x 3 bua, skip meal -> dietState.
 */
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Scan, ListChecks, Check, Camera, Upload } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Chip, Button, ProgressBar, BottomSheet } from '@/components/ui';
import { defaultMacroTargets, calculateBmr, calculateTdee, ageFromBirthday } from '@/utils/bmi';

type Segment = 'scan' | 'plan';
type Meal = 'sang' | 'trua' | 'toi';

interface ScannedFood {
  id: string;
  name: string;
  baseCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const SCAN_FIXTURES: ScannedFood[] = [
  { id: 'rice-bowl', name: 'Cơm gà xối mỡ', baseCalories: 480, protein: 32, carbs: 58, fat: 14 },
  { id: 'pho', name: 'Phở bò tái', baseCalories: 410, protein: 28, carbs: 52, fat: 9 },
  { id: 'salad', name: 'Salad ức gà', baseCalories: 320, protein: 36, carbs: 18, fat: 10 },
  { id: 'banh-mi', name: 'Bánh mì thịt nướng', baseCalories: 450, protein: 22, carbs: 52, fat: 16 },
  { id: 'bun-bo', name: 'Bún bò Huế', baseCalories: 520, protein: 30, carbs: 60, fat: 14 },
];

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
const MEALS: Meal[] = ['sang', 'trua', 'toi'];

const MEAL_PLAN: Record<Meal, { name: string; cal: number }[]> = {
  sang: [
    { name: 'Cháo yến mạch sữa tươi', cal: 340 },
    { name: 'Bánh mì ốp la', cal: 410 },
    { name: 'Smoothie chuối-yến mạch', cal: 290 },
  ],
  trua: [
    { name: 'Cơm gà + rau xào', cal: 620 },
    { name: 'Bún chả Hà Nội', cal: 540 },
    { name: 'Salad ức gà áp chảo', cal: 470 },
  ],
  toi: [
    { name: 'Cá hồi áp chảo + quinoa', cal: 520 },
    { name: 'Canh chua cá lóc', cal: 410 },
    { name: 'Đậu hũ sốt cà chua + cơm', cal: 460 },
  ],
};

export default function NutritionScreen() {
  const { user, saveUser } = useAuth();
  const theme = useTheme();
  const [segment, setSegment] = useState<Segment>('scan');

  // Scan state
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState<ScannedFood | null>(null);
  const [portion, setPortion] = useState(1);
  const sheetRef = useRef<{ expand: () => void; close: () => void }>(null);

  // Plan state
  const [selectedDay, setSelectedDay] = useState(0);
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const age = ageFromBirthday(user.profile.birthday);
  const bmr = calculateBmr(user.profile.weight, user.profile.height, age, user.profile.gender);
  const tdee = calculateTdee(bmr, 'moderate');
  const targets = defaultMacroTargets(tdee, 'maintain');

  const todayKey = `${selectedDay}-${MEALS[0]}`;

  const startScan = () => {
    setScanning(true);
    setScanProgress(0);
    const fixture = SCAN_FIXTURES[Math.floor(Math.random() * SCAN_FIXTURES.length)];
    // 2s scan animation
    const duration = 2000;
    const steps = 20;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setScanProgress(step / steps);
      if (step >= steps) {
        clearInterval(timer);
        setScanning(false);
        setScanned(fixture);
        setPortion(1);
        setTimeout(() => sheetRef.current?.expand(), 150);
      }
    }, interval);
  };

  const assignMeal = async (meal: Meal) => {
    if (!scanned) return;
    const cal = Math.round(scanned.baseCalories * portion);
    const newConsumed = user.caloriesConsumed + cal;
    const newMealSchedule = { ...user.mealSchedule, [meal]: scanned.name };
    await saveUser({ ...user, caloriesConsumed: newConsumed, mealSchedule: newMealSchedule });
    sheetRef.current?.close();
    setScanned(null);
  };

  const skipMeal = async (meal: Meal) => {
    const key = `${selectedDay}-${meal}`;
    const next = { ...skipped, [key]: !skipped[key] };
    setSkipped(next);
    if (next[key]) {
      await saveUser({ ...user, caloriesConsumed: Math.max(0, user.caloriesConsumed - 200) });
    }
  };

  const scaledCal = scanned ? Math.round(scanned.baseCalories * portion) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 24, fontWeight: '800' }}>Dinh dưỡng</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Quét món" selected={segment === 'scan'} onPress={() => setSegment('scan')} iconLeft={<Scan size={14} color={resolveColor(theme, segment === 'scan' ? 'onPrimaryContainer' : 'onSurface')} />} />
          <Chip label="Thực đơn" selected={segment === 'plan'} onPress={() => setSegment('plan')} iconLeft={<ListChecks size={14} color={resolveColor(theme, segment === 'plan' ? 'onPrimaryContainer' : 'onSurface')} />} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 96 }}>


        {segment === 'scan' && (
          <>
            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Quét món ăn</Text>
              <View
                style={{
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: resolveColor(theme, 'surfaceContainerLow'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: resolveColor(theme, 'outlineVariant'),
                  borderStyle: 'dashed',
                  overflow: 'hidden',
                  marginHorizontal: -1, // keep dashed border inside card border radius
                }}
              >
                {scanning ? (
                  <View style={{ alignItems: 'center', gap: 12 }}>
                    <Animated.View>
                      <Scan color={resolveColor(theme, 'primary')} size={48} />
                    </Animated.View>
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '600' }}>Đang phân tích...</Text>
                    <View style={{ width: 200, height: 6, backgroundColor: resolveColor(theme, 'surfaceContainerHigh'), borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ width: `${scanProgress * 100}%`, height: '100%', backgroundColor: resolveColor(theme, 'primary') }} />
                    </View>
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>{Math.round(scanProgress * 100)}%</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: 8 }}>
                    <Scan color={resolveColor(theme, 'primary')} size={48} />
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>Hướng camera vào món ăn</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Button
                  label="Chụp ảnh"
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1, minWidth: 120 }}
                  onPress={startScan}
                  iconLeft={<Camera size={14} color={resolveColor(theme, 'onPrimaryContainer')} />}
                  disabled={scanning}
                />
                <Button
                  label="Tải lên"
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1, minWidth: 120 }}
                  onPress={startScan}
                  iconLeft={<Upload size={14} color={resolveColor(theme, 'onPrimaryContainer')} />}
                  disabled={scanning}
                />
              </View>
            </Card>

            <Card variant="default">
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Mục tiêu ngày</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                <ProgressBar tone="primary" label="Calories" caption={`${user.caloriesConsumed} / ${targets.calories} kcal`} progress={Math.min(1, user.caloriesConsumed / targets.calories)} />
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
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700', marginBottom: 12 }}>Tuần này</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {WEEK_DAYS.map((day, i) => (
                    <Chip
                      key={day}
                      label={day}
                      selected={selectedDay === i}
                      onPress={() => setSelectedDay(i)}
                    />
                  ))}
                </View>
              </ScrollView>
            </Card>

            {MEALS.map((meal) => {
              const key = `${selectedDay}-${meal}`;
              const isSkipped = !!skipped[key];
              const options = MEAL_PLAN[meal];
              const option = options[selectedDay % options.length];
              return (
                <Card key={meal} variant="default">
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>
                      {meal === 'sang' ? 'Sáng' : meal === 'trua' ? 'Trưa' : 'Tối'}
                    </Text>
                    <Chip
                      label={isSkipped ? 'Đã bỏ' : 'Bỏ bữa'}
                      selected={isSkipped}
                      onPress={() => skipMeal(meal)}
                    />
                  </View>
                  {isSkipped ? (
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13, fontStyle: 'italic' }}>
                      Bữa này đã được bỏ qua (đã trừ ~200 kcal ước tính).
                    </Text>
                  ) : (
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '600' }}>{option.name}</Text>
                  )}
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
                    {option.cal} kcal
                  </Text>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Scan result BottomSheet */}
      <BottomSheet ref={sheetRef} snapPoints={['70%']}>
        {scanned && (
          <View style={{ padding: 20, gap: 16, paddingBottom: 32 }}>
            <Text
              numberOfLines={3}
              style={{ color: resolveColor(theme, 'onSurface'), fontSize: 20, fontWeight: '800' }}
            >
              {scanned.name}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, padding: 12, backgroundColor: resolveColor(theme, 'primaryContainer'), borderRadius: 12 }}>
                <Text style={{ color: resolveColor(theme, 'onPrimaryContainer'), fontSize: 11, fontWeight: '600' }}>CALORIES</Text>
                <Text style={{ color: resolveColor(theme, 'onPrimaryContainer'), fontSize: 22, fontWeight: '800' }}>{scaledCal}</Text>
              </View>
              <View style={{ flex: 1, padding: 12, backgroundColor: resolveColor(theme, 'secondaryContainer'), borderRadius: 12 }}>
                <Text style={{ color: resolveColor(theme, 'onSecondaryContainer'), fontSize: 11, fontWeight: '600' }}>PROTEIN</Text>
                <Text style={{ color: resolveColor(theme, 'onSecondaryContainer'), fontSize: 22, fontWeight: '800' }}>{Math.round(scanned.protein * portion)}g</Text>
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '600' }}>Khẩu phần</Text>
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>{portion.toFixed(2)}x</Text>
              </View>
              {/* Wrap-friendly portion row: 7 chips flex-wrap to fit any screen width. */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPortion(p)}
                    accessibilityRole="button"
                    accessibilityLabel={`Khẩu phần ${p}x`}
                    accessibilityState={{ selected: portion === p }}
                    style={{
                      minWidth: 52,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: portion === p ? resolveColor(theme, 'primary') : resolveColor(theme, 'surfaceContainerHigh'),
                    }}
                  >
                    <Text style={{ color: portion === p ? resolveColor(theme, 'onPrimary') : resolveColor(theme, 'onSurface'), fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{p}x</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Gán vào bữa</Text>
              {/* Wrap-friendly row: 3 buttons share space, wrap to next line if needed. */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  label="Sáng"
                  variant="primary"
                  size="md"
                  style={{ flex: 1, minWidth: 96 }}
                  onPress={() => assignMeal('sang')}
                  iconLeft={<Check size={14} color={resolveColor(theme, 'onPrimary')} />}
                />
                <Button
                  label="Trưa"
                  variant="primary"
                  size="md"
                  style={{ flex: 1, minWidth: 96 }}
                  onPress={() => assignMeal('trua')}
                />
                <Button
                  label="Tối"
                  variant="primary"
                  size="md"
                  style={{ flex: 1, minWidth: 96 }}
                  onPress={() => assignMeal('toi')}
                />
              </View>
            </View>
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
