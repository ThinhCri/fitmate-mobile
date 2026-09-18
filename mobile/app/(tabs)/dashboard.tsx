/**
 * DashboardScreen — FP-001, FP-002, FP-035.
 *
 * Per screen-specs Section 3.3 + Section 5.1 content parity checklist:
 * 1. Header (avatar, name, streak chip, bell, reward, VIP, support)
 * 2. Streak card
 * 3. Calorie ring + macros
 * 4. Quick action grid 2x2
 *
 * DEC-025 (2026-09-18): Homepage co chieu sau.
 *  - HomepageBackground: gradient mint teal + watermark logo.
 *  - Hero card (StreakCard) boc trong GlassCard.
 *  - Noi dung khac giu Card mat dinh (de doc so lieu + form).
 *  - Scroll padding bottom cong them ~96dp (chieu cao floating tab bar)
 *    de noi dung cuoi khong bi tab bar che.
 */
import { useMemo, useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { mockUserService } from '@/services/mockUserService';
import { ToastService, GlassCard, SkeletonStack } from '@/components/ui';
import { defaultMacroTargets, calculateBmr, calculateTdee, ageFromBirthday } from '@/utils/bmi';
import { StreakCard } from '@/features/dashboard/StreakCard';
import { CalorieRing } from '@/features/dashboard/CalorieRing';
import { QuickActionGrid } from '@/features/dashboard/QuickActionGrid';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';
import { HomepageBackground } from '@/features/homepage/HomepageBackground';

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const macros = useMemo(() => {
    if (!user) {
      return {
        calories: 2000,
        protein: { current: 0, target: 120 },
        carbs: { current: 0, target: 220 },
        fat: { current: 0, target: 70 },
      };
    }
    const age = ageFromBirthday(user.profile.birthday);
    const bmr = calculateBmr(user.profile.weight, user.profile.height, age, user.profile.gender);
    const tdee = calculateTdee(bmr, 'moderate');
    const targets = defaultMacroTargets(tdee, 'maintain');
    return {
      calories: targets.calories,
      protein: { current: 60, target: targets.protein },
      carbs: { current: 180, target: targets.carbs },
      fat: { current: 40, target: targets.fat },
    };
  }, [user]);

  if (loading || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
        <HomepageBackground>
          <View style={{ padding: 16, gap: 16 }}>
            <SkeletonStack count={4} gap={12} />
          </View>
        </HomepageBackground>
      </SafeAreaView>
    );
  }

  // DEC-024 + DEC-025: scroll padding bottom de noi dung cuoi khong bi
  // floating tab bar (pill) che.
  const contentBottomPadding = 96; // safe for pill + visual breathing room

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <HomepageBackground>
        <ScrollView
          contentContainerStyle={{ paddingBottom: contentBottomPadding }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={resolveColor(theme, 'primary')}
            />
          }
        >
          <DashboardHeader
            name={user.profile.name}
            streak={user.streak}
            notificationCount={user.notifications.filter((n) => !n.read).length}
            rewardPoints={user.rewardPoints}
            onOpenDrawer={() => router.push('/(modals)/drawer')}
            onOpenNotifications={() => router.push('/(modals)/notifications')}
            onOpenReward={() => router.push('/(modals)/withdraw')}
            onOpenVip={() => router.push('/(modals)/vip')}
            onOpenSupport={() => router.push('/(modals)/support')}
            onPressProfile={() => router.push(`/(modals)/profile/${user.email}`)}
          />

          <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 16 }}>
            {/* Hero: streak card boc trong GlassCard */}
            <GlassCard padding={16} radius={20}>
              <StreakCard
                streak={user.streak}
                target={7}
                onPress={async () => {
                  await mockUserService.saveUser({ ...user, streak: user.streak + 1 });
                  await mockUserService.getCurrentUser();
                  ToastService.show({
                    message: `Tuyệt vời! Streak = ${user.streak + 1} ngày.`,
                    tone: 'achievement',
                  });
                }}
              />
            </GlassCard>

            <CalorieRing
              consumed={user.caloriesConsumed}
              burned={user.caloriesBurned}
              target={macros.calories}
              protein={macros.protein}
              carbs={macros.carbs}
              fat={macros.fat}
            />

            <QuickActionGrid
              onPressScan={() => router.push('/(tabs)/nutrition')}
              onPressWorkout={() => router.push('/(tabs)/workout')}
              onPressBooking={() => router.push('/(tabs)/marketplace')}
              onPressChuyenSau={() => router.push('/(modals)/chuyen-sau')}
            />
          </View>
        </ScrollView>
      </HomepageBackground>
    </SafeAreaView>
  );
}
