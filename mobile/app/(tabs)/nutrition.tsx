import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { NutritionDiaryPresentation } from '@/features/nutrition/NutritionDiaryPresentation';
import {
  DayNutritionSummaryViewModel,
  FoodItemViewModel,
  MealTimeSlot,
} from '@/features/nutrition/nutritionTypes';

const DEFAULT_SUMMARY: DayNutritionSummaryViewModel = {
  dateString: '2026-09-28',
  dateDisplay: 'Thứ Hai, 28/09/2026',
  isToday: true,
  calories: {
    consumed: 1450,
    target: 2000,
    burnedExercise: 250,
  },
  macros: {
    protein: { current: 110, target: 140 },
    carbs: { current: 165, target: 220 },
    fat: { current: 42, target: 65 },
  },
  meals: [
    {
      slot: 'breakfast',
      title: 'Bữa sáng',
      subtitle: 'Khởi đầu ngày mới',
      totalCalories: 385,
      items: [
        {
          id: 'b1',
          name: 'Yến mạch nấu sữa hạnh nhân',
          portion: '1 tô (250g)',
          calories: 260,
          proteinGrams: 9,
          carbsGrams: 42,
          fatGrams: 6,
          source: 'manual',
          mealSlot: 'breakfast',
        },
        {
          id: 'b2',
          name: 'Chuối già Nam Mỹ',
          portion: '1 quả (120g)',
          calories: 125,
          proteinGrams: 1,
          carbsGrams: 30,
          fatGrams: 0,
          source: 'ai_confirmed',
          mealSlot: 'breakfast',
        },
      ],
    },
    {
      slot: 'lunch',
      title: 'Bữa trưa',
      subtitle: 'Năng lượng chính trong ngày',
      totalCalories: 650,
      items: [
        {
          id: 'l1',
          name: 'Ức gà nướng mật ong',
          portion: '150g',
          calories: 247,
          proteinGrams: 36,
          carbsGrams: 8,
          fatGrams: 5,
          source: 'ai_confirmed',
          mealSlot: 'lunch',
        },
        {
          id: 'l2',
          name: 'Cơm gạo lứt hấp',
          portion: '120g',
          calories: 134,
          proteinGrams: 3,
          carbsGrams: 28,
          fatGrams: 1,
          source: 'ai_confirmed',
          mealSlot: 'lunch',
        },
        {
          id: 'l3',
          name: 'Bông cải xanh luộc',
          portion: '150g',
          calories: 52,
          proteinGrams: 4,
          carbsGrams: 9,
          fatGrams: 0,
          source: 'manual',
          mealSlot: 'lunch',
        },
      ],
    },
    {
      slot: 'dinner',
      title: 'Bữa tối',
      subtitle: 'Nhẹ nhàng, phục hồi cơ',
      totalCalories: 415,
      items: [
        {
          id: 'd1',
          name: 'Cá hồi áp chảo dầu ô liu',
          portion: '160g',
          calories: 320,
          proteinGrams: 32,
          carbsGrams: 0,
          fatGrams: 18,
          source: 'manual',
          mealSlot: 'dinner',
        },
        {
          id: 'd2',
          name: 'Salad sốt chanh leo',
          portion: '100g',
          calories: 95,
          proteinGrams: 2,
          carbsGrams: 12,
          fatGrams: 4,
          source: 'manual',
          mealSlot: 'dinner',
        },
      ],
    },
  ],
};

export default function NutritionScreen() {
  const [segment, setSegment] = useState<'diary' | 'menu'>('diary');
  const [refreshing, setRefreshing] = useState(false);

  const handleSegmentChange = (newSegment: 'diary' | 'menu') => {
    if (newSegment === 'menu') {
      router.push('/nutrition/weekly-menu' as any);
    } else {
      setSegment('diary');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar title="Nhật ký dinh dưỡng" />

      <NutritionDiaryPresentation
        summary={DEFAULT_SUMMARY}
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
