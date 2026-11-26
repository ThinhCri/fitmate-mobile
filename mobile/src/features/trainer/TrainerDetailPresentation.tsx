import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Star,
  ShieldCheck,
  Award,
  Quote,
  MessageSquare,
  CalendarCheck,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme/designTokens';
import { TrainerDetailViewModel } from '@/services/api/types';
import { Badge } from '@/components/design-system/BadgesAndChips';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { PtServicePackageCard } from './PtServicePackageCard';
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
    mode?: 'confirm' | 'review' | 'upcoming';
  } | null;
  onViewBooking?: (appointmentId: string) => void;
  onReviewBooking?: (appointmentId: string) => void;
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
  onReviewBooking,
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

          <View style={styles.quickStatsRow}>
            <View style={[styles.quickStatBox, styles.statRating]}>
              <Text style={styles.statLabelRating}>Đánh giá</Text>
              <Text style={styles.statValueRating}>★ {trainer.rating.toFixed(1)}</Text>
              <Text style={styles.statSubRating}>{trainer.reviewCount} lượt</Text>
            </View>
            <View style={[styles.quickStatBox, styles.statExp]}>
              <Text style={styles.statLabelExp}>Kinh nghiệm</Text>
              <Text style={styles.statValueExp}>
                {trainer.experienceYears === null ? '—' : `${trainer.experienceYears} năm`}
              </Text>
              <Text style={styles.statSubExp}>{trainer.isVerified ? 'Đã xác minh' : 'Huấn luyện viên'}</Text>
            </View>
            <View style={[styles.quickStatBox, styles.statPrice]}>
              <Text style={styles.statLabelPrice}>Từ mỗi buổi</Text>
              <Text style={styles.statValuePrice} numberOfLines={1}>
                {trainer.sessionPriceVnd === null
                  ? 'Liên hệ'
                  : `${trainer.sessionPriceVnd.toLocaleString('vi-VN')}₫`}
              </Text>
              <Text style={styles.statSubPrice}>{trainer.services?.length || 0} gói tập</Text>
            </View>
          </View>

          {trainer.specialties.length > 0 && (
            <View style={styles.specialtiesWrapper}>
              {trainer.specialties.map((spec, idx) => (
                <Badge
                  key={spec + '-' + idx}
                  label={spec}
                  tone="info"
                  style={styles.specialtyBadge}
                />
              ))}
            </View>
          )}
        </View>

        {trainer.bio ? (
          <View style={styles.sectionMargin}>
            <SectionHeader title="Giới thiệu huấn luyện viên" />
            <View style={[styles.bioCard, shadow.card]}>
              <View style={styles.bioHeaderRow}>
                <View style={styles.bioBadge}>
                  <Quote size={13} color="#0F766E" />
                  <Text style={styles.bioBadgeText}>Phong cách & Kinh nghiệm</Text>
                </View>
                {trainer.isVerified && (
                  <View style={styles.bioVerifiedPill}>
                    <Award size={12} color="#1D4ED8" />
                    <Text style={styles.bioVerifiedText}>HLV Fitmate</Text>
                  </View>
                )}
              </View>
              <Text style={styles.bioText}>{trainer.bio}</Text>
            </View>
          </View>
        ) : null}

        {trainer.services && trainer.services.length > 0 ? (
          <View style={styles.sectionMargin}>
            <SectionHeader title="Các gói & Dịch vụ huấn luyện" />
            {trainer.services.map((srv) => (
              <PtServicePackageCard key={srv.id} service={srv} />
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

        {activeBooking && (
          <TouchableOpacity
            style={styles.activeBookingCard}
            activeOpacity={0.85}
            onPress={() => {
              if (activeBooking.mode === 'review' && onReviewBooking) {
                onReviewBooking(activeBooking.appointmentId);
              } else if (onViewBooking) {
                onViewBooking(activeBooking.appointmentId);
              }
            }}
            accessibilityRole="button"
          >
            <View style={styles.activeBookingIconBox}>
              {activeBooking.mode === 'review' ? (
                <Star size={20} color="#F59E0B" fill="#F59E0B" />
              ) : (
                <CalendarCheck size={20} color={colors.primary} />
              )}
            </View>
            <View style={styles.activeBookingContent}>
              <View style={styles.activeBookingHeader}>
                <Text style={styles.activeBookingTitle}>
                  {activeBooking.mode === 'confirm'
                    ? 'Buổi tập đã qua · Cần xác nhận hoàn thành'
                    : activeBooking.mode === 'review'
                    ? 'Buổi tập đã hoàn thành · Đánh giá PT ngay'
                    : 'Lịch tập của bạn với HLV này'}
                </Text>
              </View>
              <Text style={styles.activeBookingTime}>
                {new Date(activeBooking.slotStartUtc).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Badge
              label={
                activeBooking.mode === 'confirm'
                  ? 'Xác nhận'
                  : activeBooking.mode === 'review'
                  ? 'Đánh giá'
                  : 'Chi tiết'
              }
              tone={activeBooking.mode === 'confirm' ? 'warning' : 'success'}
            />
          </TouchableOpacity>
        )}
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
  quickStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  quickStatBox: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 2,
  },
  statRating: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  statLabelRating: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  statValueRating: { fontSize: 15, fontWeight: '800', color: '#92400E' },
  statSubRating: { fontSize: 11, color: '#D97706', fontWeight: '500' },

  statExp: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  statLabelExp: { fontSize: 11, fontWeight: '700', color: '#047857' },
  statValueExp: { fontSize: 15, fontWeight: '800', color: '#065F46' },
  statSubExp: { fontSize: 11, color: '#059669', fontWeight: '500' },

  statPrice: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  statLabelPrice: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  statValuePrice: { fontSize: 15, fontWeight: '800', color: '#1E40AF' },
  statSubPrice: { fontSize: 11, color: '#2563EB', fontWeight: '500' },

  bioCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    gap: spacing.sm,
  },
  bioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  bioBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  bioVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  bioVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  bioText: {
    fontSize: 14.5,
    color: '#1E293B',
    lineHeight: 23,
    fontWeight: '400',
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
