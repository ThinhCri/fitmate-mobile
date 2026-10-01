import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { MealDetailPresentation } from '@/features/nutrition/MealDetailPresentation';
import { FoodItemViewModel } from '@/features/nutrition/nutritionTypes';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function MealDetailRoute() {
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const [food, setFood] = useState<FoodItemViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }
    getNutritionRepository()
      .getFoodItem(params.id)
      .then((data) => {
        setFood(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không tìm thấy thông tin món ăn');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  const handleEdit = () => {
    if (!food) return;
    router.push({
      pathname: '/nutrition/manual-entry' as any,
      params: { id: food.id, name: food.name, slot: food.mealSlot },
    });
  };

  const handleDelete = async () => {
    if (!food) return;
    setDeleting(true);
    try {
      await getNutritionRepository().deleteFoodItem(food.id);
      router.back();
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !food) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Không tìm thấy món ăn'}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <MealDetailPresentation
        food={food}
        onBack={() => router.back()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleting}
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
