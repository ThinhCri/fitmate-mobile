import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ReviewPtPresentation } from '../../src/features/booking/ReviewPtPresentation';
import { PtReviewSubmissionViewModel } from '../../src/features/booking/bookingTypes';

const INITIAL_REVIEW: PtReviewSubmissionViewModel = {
  bookingId: 'bk-2',
  coachName: 'Minh Trang',
  serviceName: 'Yoga trị liệu cá nhân 1-1',
  rating: 5,
  feedbackText: '',
};

export default function ReviewPtScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (rating: number, feedback: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Đã gửi đánh giá',
        `Cảm ơn bạn đã đánh giá ${rating} sao cho HLV ${INITIAL_REVIEW.coachName}.`,
        [{ text: 'Về lịch hẹn', onPress: () => router.back() }]
      );
    }, 600);
  };

  return (
    <View style={styles.container}>
      <ReviewPtPresentation
        initialData={INITIAL_REVIEW}
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
