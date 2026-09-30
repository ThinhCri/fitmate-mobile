import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AiWorkoutAdjustPresentation } from '../../src/features/workout/AiWorkoutAdjustPresentation';
import { AiWorkoutAdjustmentProposalViewModel } from '../../src/features/workout/workoutTypes';

const MOCK_PROPOSAL: AiWorkoutAdjustmentProposalViewModel = {
  planId: 'plan-1',
  planTitle: 'Upper Body A — Sức mạnh',
  recoveryScorePercent: 84,
  recoveryStatusText: 'Cơ bắp sẵn sàng chịu tải (+72h nghỉ)',
  rationale:
    'Dựa trên hiệu suất buổi tập ngực ngày 24/09 đạt 100% reps nhẹ nhàng và cơ bắp đã phục hồi tốt sau 72h, hệ thống đề xuất tăng nhẹ tải trọng để tạo kích thích lũy tiến (Progressive Overload).',
  proposedChanges: [
    {
      id: 'c-1',
      exerciseName: 'Đẩy ngực với tạ đòn',
      subtitle: 'Barbell Flat Bench Press • Hiệp 2, 3, 4',
      badgeText: '+5% Tải',
      changeType: 'load_increase',
      currentValue: '50 kg × 10 reps',
      proposedValue: '52.5 kg × 10 reps',
      reason: 'RPE buổi trước dưới 7, bạn có thể tăng tải an toàn.',
      selected: true,
    },
    {
      id: 'c-2',
      exerciseName: 'Đẩy tạ đơn dốc lên',
      subtitle: 'Incline DB Press • Tất cả các hiệp',
      badgeText: '+2 Reps',
      changeType: 'reps_adjust',
      currentValue: '18 kg × 10 reps',
      proposedValue: '18 kg × 12 reps',
      reason: 'Tăng thể tích tập luyện để kích thích phì đại cơ ngực trên.',
      selected: true,
    },
    {
      id: 'c-3',
      exerciseName: 'Hít đất mở rộng tay',
      subtitle: 'Wide Push-up thay cho Dips',
      badgeText: 'Thay bài',
      changeType: 'exercise_substitution',
      currentValue: 'Dips xà kép',
      proposedValue: 'Hít đất mở rộng tay',
      reason: 'Giảm áp lực lên khớp vai trước sau khi nâng tải Bench Press.',
      selected: false,
    },
  ],
};

export default function AiWorkoutAdjustScreen() {
  const router = useRouter();

  const handleApplyChanges = (selectedIds: string[]) => {
    Alert.alert(
      'Thành công',
      `Đã cập nhật ${selectedIds.length} thay đổi đề xuất vào giáo án Upper Body A.`,
      [{ text: 'Xem giáo án', onPress: () => router.push('/workout/plan-1' as any) }]
    );
  };

  return (
    <View style={styles.container}>
      <AiWorkoutAdjustPresentation
        proposal={MOCK_PROPOSAL}
        onApplyChanges={handleApplyChanges}
        onManualEdit={() => router.push('/workout/editor' as any)}
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
