import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WeightTrackerPresentation } from '../../src/features/workout/WeightTrackerPresentation';
import { WeightRecordViewModel } from '../../src/features/workout/workoutTypes';

const INITIAL_WEIGHT_RECORDS: WeightRecordViewModel[] = [
  {
    id: 'w-1',
    weightKg: 67.8,
    recordedAt: 'Hôm nay, 07:15',
    notes: 'Đo sau khi thức dậy',
    differenceFromPreviousKg: -0.1,
  },
  {
    id: 'w-2',
    weightKg: 67.9,
    recordedAt: 'Hôm qua, 07:10',
    notes: 'Sau khi chạy bộ',
    differenceFromPreviousKg: -0.1,
  },
  {
    id: 'w-3',
    weightKg: 68.0,
    recordedAt: '26/09/2026, 07:20',
    differenceFromPreviousKg: -0.2,
  },
  {
    id: 'w-4',
    weightKg: 68.2,
    recordedAt: '24/09/2026, 07:05',
    differenceFromPreviousKg: -0.3,
  },
];

export default function WeightTrackerScreen() {
  const [records, setRecords] = useState<WeightRecordViewModel[]>(INITIAL_WEIGHT_RECORDS);

  const handleAddRecord = (weightKg: number, notes?: string) => {
    const prevWeight = records[0]?.weightKg ?? weightKg;
    const newRecord: WeightRecordViewModel = {
      id: `w-${Date.now()}`,
      weightKg,
      recordedAt: 'Vừa xong',
      notes,
      differenceFromPreviousKg: Number((weightKg - prevWeight).toFixed(1)),
    };
    setRecords([newRecord, ...records]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <View style={styles.container}>
      <WeightTrackerPresentation
        currentWeightKg={records[0]?.weightKg ?? 67.8}
        goalWeightKg={65.0}
        changeLast7DaysKg={-0.4}
        lastMeasuredText="Hôm nay, 07:15 • Đo sau khi thức dậy"
        records={records}
        onAddRecord={handleAddRecord}
        onDeleteRecord={handleDeleteRecord}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
