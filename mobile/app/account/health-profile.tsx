import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import {
  HealthProfilePresentation,
  HealthProfileData,
} from '@/features/account';

export default function HealthProfileScreen() {
  const [healthData, setHealthData] = useState<HealthProfileData>({
    medicalConditions: '',
    hasNoMedicalConditions: true,
    allergies: '',
    hasNoAllergies: true,
    workoutDays: ['mon', 'wed', 'fri'],
    preferredTimeSlots: ['06:30 - 07:30', '18:00 - 19:30'],
    notes: 'Ưu tiên các bài tập tác động ngực và cơ lõi (core).',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (values: HealthProfileData) => {
    setIsSaving(true);
    setTimeout(() => {
      setHealthData(values);
      setIsSaving(false);
      Alert.alert('Thành công', 'Hồ sơ sức khỏe & lịch tập đã được cập nhật.', [
        { text: 'Xong', onPress: () => router.back() },
      ]);
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <HealthProfilePresentation
        initialValues={healthData}
        isSaving={isSaving}
        onBack={() => router.back()}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
