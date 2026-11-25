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
  Briefcase,
  Clock,
  MessageSquare,
  CalendarCheck,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme/designTokens';
import { TrainerDetailViewModel } from '@/services/api/types';
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
  trainer?: TrainerDetailViewModel | null;
  loading?: boolean;
  isNotFound?: boolean;
  isError?: boolean;
  isOffline?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  bookingEnabled?: boolean;
  chatEnabled?: boolean;
  onBookPress?: () => void;
  onChatPress?: () => void;
  activeBooking?: {
    appointmentId: string;
    slotStartUtc: string;
    status: string;
  } | null;
  onViewBooking?: (appointmentId: string) => void;
}

export const TrainerDetailPresentation: React.FC<TrainerDetailPresentationProps> = ({
  trainer,
  loading = false,
  isNotFound = false,
  isError = false,
  isOffline = false,
  onRetry,
  onBack,
  bookingEnabled = false,
  chatEnabled = false,
  onBookPress,
  onChatPress,
  activeBooking,
  onViewBooking,
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
    return <OfflineState title="Không có kết nối mạng" onAction={onRetry} />;
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

  const formattedPrice = trainer.sessionPriceVnd === null ? 'Chưa công bố giá' : new Intl.NumberFormat('vi-VN', {
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
                {trainer.experienceYears === null ? 'Chưa cập nhật kinh nghiệm' : `Kinh nghiệm: ${trainer.experienceYears} năm huấn luyện`}
              </Text>
            </View>
          </View>

          <View style={styles.specialtiesWrapper}>
            {trainer.specialties.map((spec, idx) => (
              <Badge
                key={spec + '-' + idx}
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

        {trainer.services && trainer.services.length > 0 ? (
          <View style={styles.sectionMargin}>
            <SectionHeader title="Các gói & Dịch vụ huấn luyện" />
            {trainer.services.map((srv) => (
              <View key={srv.id} style={[styles.serviceCard, shadow.card]}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceTitleRow}>
                    <Briefcase size={18} color={colors.primary} />
                    <Text style={[typography.bodyBold, styles.serviceTitle]}>
                      {srv.name}
                    </Text>
                  </View>
                  <Text style={[typography.bodyBold, styles.servicePrice]}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    }).format(srv.priceVnd)}
                  </Text>
                </View>
                {srv.description ? (
                  <Text style={[typography.body, styles.serviceDesc]}>
                    {srv.description}
                  </Text>
                ) : null}
                <Text style={[typography.caption, styles.serviceMetaText]}>
                  {srv.serviceKind === 'assessment_and_plan' ? 'Buổi đánh giá & bàn giao kế hoạch' : 'Buổi tập 1–1'} · {srv.deliveryMode === 'online' ? 'Online' : 'Trực tiếp'}
                </Text>
                {!!srv.targetAudience && <Text style={[typography.caption, styles.serviceMetaText]}>Phù hợp: {srv.targetAudience}</Text>}
                {!!srv.requiredEquipment && <Text style={[typography.caption, styles.serviceMetaText]}>Chuẩn bị: {srv.requiredEquipment}</Text>}
                {!!srv.deliverable && <Text style={[typography.caption, styles.serviceMetaText]}>Bạn nhận được: {srv.deliverable}</Text>}
                {!!srv.locationName && <Text style={[typography.caption, styles.serviceMetaText]}>Địa điểm: {srv.locationName}, {srv.locationAddress}</Text>}
                <View style={styles.serviceMetaRow}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={[typography.caption, styles.serviceMetaText]}>
                    Thời lượng: {srv.durationMinutes} phút/buổi
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {trainer.reviews && trainer.reviews.length > 0 ? (
          <View style={styles.sectionMargin}>
            <SectionHeader
              title={'Đánh giá từ học viên (' + trainer.reviews.length + ')'}
            />
            {trainer.reviews.map((rev) => (
              <View key={rev.id} style={[styles.reviewCard, shadow.card]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewRating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color="#F59E0B"
                        fill={i < rev.rating ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                    <Text style={[typography.captionMedium, styles.ratingNumber]}>
                      {rev.rating}.0
                    </Text>
                  </View>
                  <Text style={[typography.caption, styles.reviewDate]}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}
                  </Text>
                </View>
                <Text style={[typography.body, styles.reviewComment]}>
                  {`"${rev.comment}"`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        
      </ScrollView>

      <View style={[styles.bottomBar, shadow.floating]}>
        <View style={styles.bottomPriceCol}>
          <Text style={[typography.caption, styles.priceSubtitle]}>Học phí tham khảo</Text>
          <Text style={[typography.title2, styles.priceMain]}>
            {formattedPrice}
            {trainer.sessionPriceVnd !== null && <Text style={[typography.caption, styles.priceSub]}>/buổi</Text>}
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <SecondaryButton
            label="Nhắn tin"
            leftIcon={<MessageSquare size={18} color={colors.textMuted} />}
            onPress={onChatPress || (() => {})}
            disabled={!chatEnabled}
            style={styles.chatButton}
          />
          <PrimaryButton
            label="Đặt lịch"
            onPress={onBookPress || (() => {})}
            disabled={!bookingEnabled}
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
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceTitle: {
    color: colors.textPrimary,
  },
  servicePrice: {
    color: colors.primaryDark,
  },
  serviceDesc: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  serviceMetaText: {
    color: colors.textSecondary,
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
    marginBottom: spacing.xs,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumber: {
    color: colors.textPrimary,
    marginLeft: 4,
  },
  reviewDate: {
    color: colors.textMuted,
  },
  reviewComment: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  activeBookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F0',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  activeBookingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBookingContent: {
    flex: 1,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBookingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  activeBookingTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
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
