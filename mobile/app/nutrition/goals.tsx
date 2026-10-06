import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { Card } from '@/components/design-system/Card';
import { InputField } from '@/components/design-system/Inputs';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { apiClient } from '@/services/api/client';
import { colors, spacing, typography } from '@/theme/designTokens';

type NutritionGoalPreferences = {
  target_calories?: number | null;
  target_protein_g?: number | null;
  target_carbs_g?: number | null;
  target_fat_g?: number | null;
};

export default function NutritionGoalsRoute() {
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    apiClient<NutritionGoalPreferences>('/users/me/preferences')
      .then((value) => {
        if (!active) return;
        setCalories(value.target_calories ? String(value.target_calories) : '');
        setProtein(value.target_protein_g != null ? String(value.target_protein_g) : '');
        setCarbs(value.target_carbs_g != null ? String(value.target_carbs_g) : '');
        setFat(value.target_fat_g != null ? String(value.target_fat_g) : '');
      })
      .catch((error) => Alert.alert('Không thể tải mục tiêu', error instanceof Error ? error.message : 'Vui lòng thử lại.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  const save = async () => {
    const values = {
      target_calories: Number(calories),
      target_protein_g: Number(protein),
      target_carbs_g: Number(carbs),
      target_fat_g: Number(fat),
    };
    if (!Number.isInteger(values.target_calories) || values.target_calories < 1 || values.target_calories > 10000) {
      Alert.alert('Mục tiêu chưa hợp lệ', 'Calories phải là số nguyên từ 1 đến 10.000 kcal.');
      return;
    }
    if ([values.target_protein_g, values.target_carbs_g, values.target_fat_g].some((value) => !Number.isInteger(value) || value < 0 || value > 1000)) {
      Alert.alert('Mục tiêu chưa hợp lệ', 'Các mục tiêu dinh dưỡng phải là số nguyên từ 0 đến 1.000 gram.');
      return;
    }
    setSaving(true);
    try {
      await apiClient('/users/me/preferences', { method: 'PUT', body: JSON.stringify(values) });
      Alert.alert('Đã lưu mục tiêu', 'Nhật ký và trang chủ sẽ sử dụng mục tiêu mới.', [
        { text: 'Xong', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Không thể lưu mục tiêu', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <AppTopBar title="Thiết lập mục tiêu" onBack={() => router.back()} />
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View> : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <Text style={[typography.body, styles.helper]}>Đặt giới hạn bạn muốn theo dõi mỗi ngày. Đây là mục tiêu cá nhân, không phải chẩn đoán y khoa.</Text>
          <Card padding="md" style={styles.card}>
            <InputField label="Năng lượng mỗi ngày (kcal) *" value={calories} onChangeText={setCalories} keyboardType="number-pad" placeholder="Ví dụ: 2000" />
            <InputField label="Đạm mỗi ngày (g)" value={protein} onChangeText={setProtein} keyboardType="number-pad" placeholder="Ví dụ: 120" />
            <InputField label="Tinh bột mỗi ngày (g)" value={carbs} onChangeText={setCarbs} keyboardType="number-pad" placeholder="Ví dụ: 250" />
            <InputField label="Chất béo mỗi ngày (g)" value={fat} onChangeText={setFat} keyboardType="number-pad" placeholder="Ví dụ: 65" />
          </Card>
          <PrimaryButton label="Lưu mục tiêu" onPress={() => void save()} loading={saving} fullWidth />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
  helper: { color: colors.textSecondary, lineHeight: 21 },
  card: { gap: spacing.md, backgroundColor: colors.surface },
});
