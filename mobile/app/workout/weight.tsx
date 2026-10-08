import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WeightTrackerPresentation } from '../../src/features/workout/WeightTrackerPresentation';
import { WeightRecordViewModel } from '../../src/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';

export default function WeightTrackerScreen() {
  const [records, setRecords] = useState<WeightRecordViewModel[]>([]);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [goalWeight, setGoalWeight] = useState(0);
  const [changeLast7Days, setChangeLast7Days] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWorkoutRepository()
      .getWeightRecords()
      .then((data) => {
        setRecords(data.records);
        setCurrentWeight(data.currentWeightKg);
        setGoalWeight(data.goalWeightKg);
        setChangeLast7Days(data.changeLast7DaysKg);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải lịch sử cân nặng');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddRecord = async (weightKg: number, notes?: string) => {
    try {
      const newRecord = await getWorkoutRepository().addWeightRecord(weightKg, notes);
      setRecords((prev) => [newRecord, ...prev]);
      setCurrentWeight(weightKg);
    } catch (err: any) {
      setError(err?.message || 'Không thể ghi nhận cân nặng');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await getWorkoutRepository().deleteWeightRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa cân nặng');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  if (error && records.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WeightTrackerPresentation
        currentWeightKg={currentWeight}
        goalWeightKg={goalWeight}
        changeLast7DaysKg={changeLast7Days}
        lastMeasuredText={records[0]?.recordedAt ? `${records[0].recordedAt} • ${records[0].notes || 'Gần đây'}` : 'Chưa có bản ghi'}
        records={records}
        onAddRecord={handleAddRecord}
        onDeleteRecord={handleDeleteRecord}
        onUpdateGoal={async (value) => {
          try {
            const goals = await getWorkoutRepository().updateWorkoutGoals({ targetWeightKg: value });
            setGoalWeight(goals.targetWeightKg ?? value);
          } catch (err: any) {
            setError(err?.message || 'Không thể lưu mục tiêu cân nặng');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
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
