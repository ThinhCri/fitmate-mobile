import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Star, ShieldCheck } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { PtReviewSubmissionViewModel } from './bookingTypes';

export interface ReviewPtPresentationProps {
  initialData: PtReviewSubmissionViewModel;
  onSubmitReview: (rating: number, feedback: string) => void;
  isSubmitting?: boolean;
}

export function ReviewPtPresentation({
  initialData,
  onSubmitReview,
  isSubmitting = false,
}: ReviewPtPresentationProps) {
  const [rating, setRating] = useState<number>(initialData.rating || 5);
  const [feedback, setFeedback] = useState<string>(initialData.feedbackText || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      setValidationError('Vui lòng chọn số sao đánh giá (1 - 5 sao)');
      return;
    }
    setValidationError(null);
    onSubmitReview(rating, feedback.trim());
  };

  const ratingDescriptions: Record<number, string> = {
    1: 'Rất không hài lòng',
    2: 'Cần cải thiện',
    3: 'Bình thường',
    4: 'Tốt & nhiệt tình',
    5: 'Xuất sắc & chuyên nghiệp',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      <Card style={styles.card}>
        {/* Header context */}
        <View style={styles.contextHeader}>
          <Text style={styles.coachName}>HLV {initialData.coachName}</Text>
          <Text style={styles.serviceName}>{initialData.serviceName}</Text>
        </View>

        {/* Star Rating Selector */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingSectionTitle}>Mức độ hài lòng của bạn</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starBtn}
                accessibilityRole="button"
                accessibilityLabel={`${star} sao`}
              >
                <Star
                  size={36}
                  color={star <= rating ? '#F59E0B' : colors.border}
                  fill={star <= rating ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingDesc}>{ratingDescriptions[rating]}</Text>
        </View>

        {/* Feedback Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Nhận xét chi tiết (tùy chọn):</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Chia sẻ trải nghiệm về sự hướng dẫn, kỹ thuật và tác phong của HLV..."
            placeholderTextColor={colors.textMuted}
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>

        {validationError && <Text style={styles.errorText}>{validationError}</Text>}

        {/* Transparency note */}
        <View style={styles.noticeBox}>
          <ShieldCheck size={16} color={colors.primary} />
          <Text style={styles.noticeText}>
            Đánh giá của bạn giúp cộng đồng Fitmate lựa chọn HLV phù hợp và nâng cao chất lượng dịch vụ.
          </Text>
        </View>

        <PrimaryButton
          label="Gửi đánh giá"
          loading={isSubmitting}
          onPress={handleSubmit}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  contextHeader: {
    alignItems: 'center',
    gap: 2,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  ratingSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ratingSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  starBtn: {
    padding: 4,
  },
  ratingDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  inputSection: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#F0FDFA',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.primary,
    lineHeight: 15,
  },
});
