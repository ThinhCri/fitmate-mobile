import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppTopBar } from '@/components/design-system/AppTopBar';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { getWorkoutRepository } from '@/repositories/workoutRepository';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export default function WorkoutGoalsScreen() {
  const router = useRouter();
  const [targetWeight, setTargetWeight] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWorkoutRepository().getWorkoutGoals()
      .then((goals) => {
        setTargetWeight(goals.targetWeightKg == null ? '' : String(goals.targetWeightKg));
        setMonthlyTarget(goals.monthlyWorkoutTarget == null ? '' : String(goals.monthlyWorkoutTarget));
      })
      .catch((reason) => Alert.alert('Không thể tải mục tiêu', reason instanceof Error ? reason.message : 'Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const weight = Number(targetWeight.replace(',', '.'));
    const workouts = Number(monthlyTarget);
    if (!Number.isFinite(weight) || weight < 20 || weight > 400) {
      Alert.alert('Mục tiêu chưa hợp lệ', 'Cân nặng mục tiêu phải từ 20 đến 400 kg.');
      return;
    }
    if (!Number.isInteger(workouts) || workouts < 1 || workouts > 62) {
      Alert.alert('Mục tiêu chưa hợp lệ', 'Số buổi tập mỗi tháng phải từ 1 đến 62.');
      return;
    }
    setSaving(true);
    try {
      await getWorkoutRepository().updateWorkoutGoals({
        targetWeightKg: weight,
        monthlyWorkoutTarget: workouts,
      });
      Alert.alert('Đã lưu mục tiêu', 'Tiến độ tập luyện và cân nặng sẽ dùng mục tiêu mới.', [
        { text: 'Xong', onPress: () => router.back() },
      ]);
    } catch (reason) {
      Alert.alert('Không thể lưu mục tiêu', reason instanceof Error ? reason.message : 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.safe}>
      <AppTopBar title="Mục tiêu tập luyện" onBack={() => router.back()} />
      {loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> : (
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Card style={styles.card}>
            <Text style={styles.title}>Mục tiêu cá nhân</Text>
            <Text style={styles.helper}>Các con số này dùng để theo dõi tiến độ, không thay thế tư vấn y tế.</Text>
            <Text style={styles.label}>Cân nặng mục tiêu (kg)</Text>
            <TextInput style={styles.input} keyboardType="decimal-pad" value={targetWeight} onChangeText={setTargetWeight} placeholder="Ví dụ: 65" />
            <Text style={styles.label}>Số buổi tập mỗi tháng</Text>
            <TextInput style={styles.input} keyboardType="number-pad" value={monthlyTarget} onChangeText={setMonthlyTarget} placeholder="Ví dụ: 12" />
            <PrimaryButton label="Lưu mục tiêu" onPress={() => void save()} loading={saving} fullWidth />
          </Card>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loader: { marginTop: spacing.xl },
  content: { flex: 1, padding: spacing.md },
  card: { gap: spacing.sm },
  title: { ...typography.title3, color: colors.textPrimary },
  helper: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  label: { ...typography.bodyMedium, color: colors.textPrimary },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, color: colors.textPrimary, backgroundColor: colors.surface, marginBottom: spacing.sm },
});
