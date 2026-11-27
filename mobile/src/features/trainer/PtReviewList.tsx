import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme/designTokens';
import type { TrainerReviewViewModel } from '@/services/api/types';

export interface PtReviewListProps {
  reviews: TrainerReviewViewModel[];
  emptyMessage?: string;
}

/**
 * Shared public student review list used across trainer detail and PT profile screens.
 */
export function PtReviewList({
  reviews,
  emptyMessage = 'Chưa có đánh giá nào từ học viên.',
}: PtReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Star size={18} color={colors.textMuted} />
        <Text style={[typography.caption, styles.emptyText]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {reviews.map((rev) => {
        const displayName = rev.reviewerName?.trim() || 'Học viên Fitmate';
        const initial = displayName.charAt(0).toUpperCase();
        return (
          <View key={rev.id} style={[styles.reviewCard, shadow.card]}>
            <View style={styles.topRow}>
              <View style={styles.authorRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
                <View style={styles.authorMeta}>
                  <Text style={[typography.bodyBold, styles.authorName]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        color="#F59E0B"
                        fill={i < rev.rating ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                    <Text style={[typography.captionMedium, styles.ratingNumber]}>
                      {rev.rating}.0
                    </Text>
                  </View>
                </View>
              </View>
              {!!rev.createdAt && (
                <Text style={[typography.caption, styles.reviewDate]}>
                  {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>
            {!!rev.comment && (
              <Text style={[typography.body, styles.reviewComment]}>
                {rev.comment}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emptyText: {
    color: colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  authorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  authorMeta: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumber: {
    color: colors.textPrimary,
    marginLeft: 4,
    fontSize: 12,
  },
  reviewDate: {
    color: colors.textMuted,
    fontSize: 11,
  },
  reviewComment: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
    fontSize: 13,
  },
});
