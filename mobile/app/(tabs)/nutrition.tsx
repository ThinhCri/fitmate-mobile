import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { NutritionDiaryPresentation } from '@/features/nutrition/NutritionDiaryPresentation';
import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  MealTimeSlot,
} from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function NutritionScreen() {
  const [summary, setSummary] = useState<DayNutritionSummaryViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<'diary' | 'menu'>('diary');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const data = await getNutritionRepository().getDaySummary();
      setSummary(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải nhật ký dinh dưỡng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleSegmentChange = (newSegment: 'diary' | 'menu') => {
    if (newSegment === 'menu') {
      router.push('/nutrition/weekly-menu' as any);
    } else {
      setSegment('diary');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading) {
    return (
      <ScreenContainer edges={['top']}>
        <AppTopBar title="Nhật ký dinh dưỡng" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !summary) {
    return (
      <ScreenContainer edges={['top']}>
        <AppTopBar title="Nhật ký dinh dưỡng" />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Không có dữ liệu dinh dưỡng'}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar title="Nhật ký dinh dưỡng" />

      <NutritionDiaryPresentation
        summary={summary}
        activeSegment={segment}
        onSegmentChange={handleSegmentChange}
        onPrevDay={() => {}}
        onNextDay={() => {}}
        onSelectDate={() => {}}
        onAddManualPress={(slot?: MealTimeSlot) => {
          router.push({
            pathname: '/nutrition/manual-entry' as any,
            params: slot ? { slot } : {},
          });
        }}
        onScanPress={() => router.push('/nutrition/scan' as any)}
        onFoodItemPress={(item: FoodItemViewModel) => {
          router.push({
            pathname: '/nutrition/[id]' as any,
            params: { id: item.id, name: item.name },
          });
        }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
  },
});
