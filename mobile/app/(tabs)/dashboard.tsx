import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { MemberHomePresentation } from '@/features/dashboard/MemberHomePresentation';
import { memberHomeFixture } from '@/mocks/preview';
import { MemberDashboardSummary } from '@/services/api/types';

export default function DashboardScreen() {
  const [data, setData] = useState<MemberDashboardSummary>(memberHomeFixture);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setData({ ...memberHomeFixture });
      setRefreshing(false);
    }, 600);
  }, []);

  return (
    <ScreenContainer edges={['top']}>
      <MemberHomePresentation
        data={data}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onLogMealPress={() => router.push('/(tabs)/nutrition')}
        onScanMealPress={() => router.push('/(tabs)/nutrition')}
        onStartWorkoutPress={() => router.push('/(tabs)/workouts')}
        onFindTrainerPress={() => router.push('/(tabs)/marketplace')}
        onNotificationPress={() => router.push('/(modals)/notifications')}
        onWorkoutDetailPress={(id) => {
          console.log('Navigate to workout:', id);
        }}
      />
    </ScreenContainer>
  );
}
