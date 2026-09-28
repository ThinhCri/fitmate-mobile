import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {
  Star,
  ShieldCheck,
  Award,
  Calendar,
  Clock,
  MessageSquare,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme/designTokens';
import { TrainerPublicDetail } from '@/services/api/types';
import { Badge } from '@/components/design-system/BadgesAndChips';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import {
  ErrorState,
  LoadingSkeleton,
  NotFoundErrorState,
  OfflineState,
} from '@/components/design-system/FeedbackStates';

export interface TrainerDetailPresentationProps {
  trainer?: TrainerPublicDetail | null;
  loading?: boolean;
  isNotFound?: boolean;
  isError?: boolean;
  isOffline?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onBookPress?: (trainerId: string) => void;
  onChatPress?: (trainerId: string) => void;
}

export const TrainerDetailPresentation: React.FC<TrainerDetailPresentationProps> = ({
  trainer,
  loading = false,
  isNotFound = false,
  isError = false,
  isOffline = false,
  onRetry,
  onBack,
  onBookPress,
  onChatPress,
}) => {
  if (isNotFound) {
    return (
      <NotFoundErrorState
        title="Không tìm thấy huấn luyện viên"
        description="Huấn luyện viên này không tồn tại hoặc hồ sơ công khai đã bị gỡ."
        actionLabel="Quay lại danh sách"
        onAction={onBack}
      />
    );
  }

  if (isOffline) {
    return <OfflineState onAction={onRetry} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Lỗi tải hồ sơ PT"
        description="Không thể kết nối đến máy chủ để lấy thông tin. Vui lòng thử lại."
        onAction={onRetry}
      />
    );
  }

  if (loading || !trainer) {
    return <LoadingSkeleton count={3} />;
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(trainer.sessionPriceVnd);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, shadow.card]}>
          <View style={styles.avatarRow}>
            {trainer.avatarUrl ? (
              <Image source={{ uri: trainer.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {trainer.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <Text style={[typography.title1, styles.trainerName]}>
                  {trainer.name}
                </Text>
                {trainer.isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={16} color={colors.primary} />
                  </View>
                ) : null}
              </View>

              <View style={styles.ratingRow}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={[typography.bodyBold, styles.ratingText]}>
                  {trainer.rating.toFixed(1)}
                </Text>
                <Text style={[typography.caption, styles.reviewCount]}>
                  ({trainer.reviewCount} đánh giá từ học viên)
                </Text>
              </View>

              <Text style={[typography.caption, styles.experienceText]}>
                Kinh nghiệm: {trainer.experienceYears ?? 3}+ năm huấn luyện
              </Text>
            </View>
          </View>

          <View style={styles.specialtiesWrapper}>
            {trainer.specialties.map((spec, idx) => (
              <Badge
                key={`${spec}-${idx}`}
                label={spec}
                tone="neutral"
                style={styles.specialtyBadge}
              />
            ))}
          </View>
        </View>

        {trainer.bio ? (
          <View style={styles.sectionMargin}>
            <SectionHeader title="Giới thiệu bản thân" />
            <View style={[styles.card, shadow.card]}>
              <Text style={[typography.body, styles.bioText]}>{trainer.bio}</Text>
            </View>
          </View>
        ) : null}

        {trainer.certificates && trainer.certificates.length > 0 ? (
          <View style={styles.sectionMargin}>
            <SectionHeader title="Bằng cấp & Chứng chỉ chuyên môn" />
            <View style={[styles.card, shadow.card]}>
              {trainer.certificates.map((cert) => (
                <View key={cert.id} style={styles.certItem}>
                  <Award size={20} color={colors.primary} style={styles.certIcon} />
                  <View style={styles.certContent}>
                    <Text style={[typography.bodyMedium, styles.certTitle]}>
                      {cert.title}
                    </Text>
                    <Text style={[typography.caption, styles.certIssuer]}>
                      {cert.issuer} • Năm {cert.year}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionMargin}>
          <SectionHeader title="Khung giờ nhận dạy" />
          <View style={[styles.card, shadow.card]}>
            <View style={styles.scheduleRow}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={[typography.bodyMedium, styles.scheduleLabel]}>
                Các ngày trong tuần:
              </Text>
            </View>
            <View style={styles.daysBadgeGroup}>
              {trainer.availableDays.map((day, idx) => (
                <Badge
                  key={`${day}-${idx}`}
                  label={day}
                  tone="info"
                  style={styles.dayBadge}
                />
              ))}
            </View>

            <View style={[styles.scheduleRow, { marginTop: spacing.md }]}>
              <Clock size={18} color={colors.textSecondary} />
              <Text style={[typography.bodyMedium, styles.scheduleLabel]}>
                Khung giờ khả dụng:
              </Text>
            </View>
            <View style={styles.daysBadgeGroup}>
              {trainer.availableTimeSlots.map((slot, idx) => (
                <Badge
                  key={`${slot}-${idx}`}
                  label={slot}
                  tone="neutral"
                  style={styles.dayBadge}
                />
              ))}
            </View>
          </View>
        </View>

        {trainer.reviews && trainer.reviews.length > 0 ? (
          <View style={styles.sectionMargin}>
            <SectionHeader
              title={`Đánh giá (${trainer.reviews.length})`}
            />
            {trainer.reviews.map((rev) => (
              <View key={rev.id} style={[styles.reviewCard, shadow.card]}>
                <View style={styles.reviewHeader}>
                  <Text style={[typography.bodyBold, styles.reviewerName]}>
                    {rev.reviewerName}
                  </Text>
                  <View style={styles.reviewRating}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[typography.captionMedium, styles.ratingNumber]}>
                      {rev.rating}
                    </Text>
                  </View>
                </View>
                <Text style={[typography.caption, styles.reviewDate]}>
                  {rev.date}
                </Text>
                <Text style={[typography.body, styles.reviewComment]}>
                  "{rev.comment}"
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.bottomBar, shadow.floating]}>
        <View style={styles.bottomPriceCol}>
          <Text style={[typography.caption, styles.priceSubtitle]}>Học phí</Text>
          <Text style={[typography.title2, styles.priceMain]}>
            {formattedPrice}
            <Text style={[typography.caption, styles.priceSub]}>/buổi</Text>
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <SecondaryButton
            label="Nhắn tin"
            leftIcon={<MessageSquare size={18} color={colors.textPrimary} />}
            onPress={() => onChatPress?.(trainer.id)}
            style={styles.chatButton}
          />
          <PrimaryButton
            label="Đặt lịch tập"
            onPress={() => onBookPress?.(trainer.id)}
            style={styles.bookButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '700',
  },
  heroInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trainerName: {
    color: colors.textPrimary,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: colors.textPrimary,
    marginLeft: 4,
  },
  reviewCount: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  experienceText: {
    color: colors.textMuted,
    marginTop: 4,
  },
  specialtiesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  specialtyBadge: {
    marginRight: 4,
  },
  sectionMargin: {
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  certIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  certContent: {
    flex: 1,
  },
  certTitle: {
    color: colors.textPrimary,
  },
  certIssuer: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scheduleLabel: {
    color: colors.textPrimary,
  },
  daysBadgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dayBadge: {
    marginRight: 4,
    marginBottom: 4,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    color: colors.textPrimary,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    color: colors.textPrimary,
  },
  reviewDate: {
    color: colors.textMuted,
    marginTop: 2,
  },
  reviewComment: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  priceSubtitle: {
    color: colors.textMuted,
  },
  priceMain: {
    color: colors.primaryDark,
  },
  priceSub: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chatButton: {
    minWidth: 100,
  },
  bookButton: {
    minWidth: 120,
  },
});
