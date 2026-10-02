import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReviewPtPresentation } from '../../src/features/booking/ReviewPtPresentation';
import { PtReviewSubmissionViewModel } from '../../src/features/booking/bookingTypes';
import { getBookingRepository } from '@/repositories/bookingRepository';

export default function ReviewPtScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId?: string;
    ptId?: string;
    coachName?: string;
    serviceName?: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData: PtReviewSubmissionViewModel = {
    bookingId: params.bookingId || 'bk-2',
    coachName: params.coachName ? decodeURIComponent(params.coachName) : 'Huấn luyện viên',
    serviceName: params.serviceName ? decodeURIComponent(params.serviceName) : 'Buổi tập cá nhân 1-1',
    rating: 5,
    feedbackText: '',
  };

  const handleSubmit = async (rating: number, feedback: string) => {
    const ptId = params.ptId || params.bookingId;
    if (!ptId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin huấn luyện viên để đánh giá.');
      return;
    }

    setIsSubmitting(true);
    try {
      const repo = getBookingRepository();
      await repo.submitReview(ptId, rating, feedback);
      Alert.alert(
        'Đã gửi đánh giá thành công',
        `Cảm ơn bạn đã đánh giá ${rating} sao cho ${initialData.coachName}.`,
        [{ text: 'Về lịch hẹn', onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert(
        'Gửi đánh giá thất bại',
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi đánh giá.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ReviewPtPresentation
        initialData={initialData}
        onSubmitReview={handleSubmit}
        isSubmitting={isSubmitting}
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
