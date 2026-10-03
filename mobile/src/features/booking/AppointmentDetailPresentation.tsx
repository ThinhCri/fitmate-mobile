import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  FileText,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { BookingAppointmentViewModel } from './bookingTypes';

export interface AppointmentDetailPresentationProps {
  appointment: BookingAppointmentViewModel;
  onCancelBooking?: () => void;
  onReschedule?: () => void;
  onReviewPt?: () => void;
  onMessageCoach?: () => void;
  onContactSupport?: () => void;
  onConfirmCompletion?: () => void;
  onDisputeCompletion?: () => void;
}

export function AppointmentDetailPresentation({
  appointment,
  onCancelBooking,
  onReschedule,
  onReviewPt,
  onMessageCoach,
  onContactSupport,
  onConfirmCompletion,
  onDisputeCompletion,
}: AppointmentDetailPresentationProps) {
  const getBookingStatusBadge = (status: BookingAppointmentViewModel['bookingStatus']) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Đã xác nhận', bg: '#DCFCE7', text: '#16A34A' };
      case 'in_progress':
        return { label: 'Đang diễn ra', bg: '#E6F4F1', text: colors.primary };
      case 'completed':
        return { label: 'Đã hoàn thành', bg: '#DCFCE7', text: '#16A34A' };
      case 'awaiting_member_confirmation':
        return { label: 'Chờ bạn xác nhận', bg: '#FEF3C7', text: '#D97706' };
      case 'disputed':
        return { label: 'Đang xử lý khiếu nại', bg: '#FEE2E2', text: '#DC2626' };
      case 'cancelled':
        return { label: 'Đã hủy', bg: '#FEE2E2', text: '#DC2626' };
      case 'hold_pending_payment':
        return { label: 'Chờ thanh toán', bg: '#FEF3C7', text: '#D97706' };
      default:
        return { label: 'Lịch hẹn', bg: '#F1F5F9', text: colors.textSecondary };
    }
  };

  const getPaymentStatusBadge = (status: BookingAppointmentViewModel['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return { label: 'Đã thanh toán', bg: '#DCFCE7', text: '#16A34A' };
      case 'refund_pending':
        return { label: 'Đang xử lý hoàn tiền', bg: '#FEF3C7', text: '#D97706' };
      case 'refunded':
        return { label: 'Đã hoàn tiền', bg: '#EFF6FF', text: '#2563EB' };
      case 'failed':
        return { label: 'Thanh toán lỗi', bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { label: 'Chưa thanh toán', bg: '#FEF3C7', text: '#D97706' };
    }
  };

  const bBadge = getBookingStatusBadge(appointment.bookingStatus);
  const pBadge = getPaymentStatusBadge(appointment.paymentStatus);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Status Bar */}
      <View style={styles.topStatusRow}>
        <View>
          <Text style={styles.bookingCodeLabel}>Mã lịch hẹn</Text>
          <Text style={styles.bookingCode}>#{appointment.bookingCode}</Text>
        </View>

        <View style={styles.badgesCol}>
          <View style={[styles.badgePill, { backgroundColor: bBadge.bg }]}>
            <Text style={[styles.badgeText, { color: bBadge.text }]}>{bBadge.label}</Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: pBadge.bg }]}>
            <Text style={[styles.badgeText, { color: pBadge.text }]}>{pBadge.label}</Text>
          </View>
        </View>
      </View>

      {/* Coach Card */}
      <Card style={styles.card}>
        <Text style={styles.cardSectionTitle}>Huấn luyện viên phụ trách</Text>
        <View style={styles.coachRow}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachInitial}>{appointment.coach.name.charAt(0)}</Text>
            {appointment.coach.isVerified && (
              <View style={styles.verifiedDot}>
                <CheckCircle2 size={10} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.coachInfo}>
            <Text style={styles.coachName}>{appointment.coach.name}</Text>
            <Text style={styles.coachTitle}>{appointment.coach.specialty}</Text>
            <View style={styles.ratingRow}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingValue}>{appointment.coach.rating.toFixed(1)}</Text>
            </View>
          </View>

          {onMessageCoach && (
            <SecondaryButton label="Nhắn tin" onPress={onMessageCoach} />
          )}
        </View>
      </Card>

      {/* Appointment Information Card */}
      <Card style={styles.card}>
        <Text style={styles.cardSectionTitle}>Chi tiết buổi tập</Text>

        <View style={styles.detailLine}>
          <FileText size={16} color={colors.primary} />
          <View style={styles.detailLineText}>
            <Text style={styles.detailLineLabel}>Gói dịch vụ</Text>
            <Text style={styles.detailLineValue}>{appointment.serviceName}</Text>
          </View>
        </View>

        <View style={styles.detailLine}>
          <Calendar size={16} color={colors.primary} />
          <View style={styles.detailLineText}>
            <Text style={styles.detailLineLabel}>Ngày tập</Text>
            <Text style={styles.detailLineValue}>{appointment.scheduledDate}</Text>
          </View>
        </View>

        <View style={styles.detailLine}>
          <Clock size={16} color={colors.primary} />
          <View style={styles.detailLineText}>
            <Text style={styles.detailLineLabel}>Khung giờ</Text>
            <Text style={styles.detailLineValue}>{appointment.scheduledTime}</Text>
          </View>
        </View>

        <View style={styles.detailLine}>
          <MapPin size={16} color={colors.primary} />
          <View style={styles.detailLineText}>
            <Text style={styles.detailLineLabel}>Địa điểm</Text>
            <Text style={styles.detailLineValue}>{appointment.location}</Text>
          </View>
        </View>
      </Card>

      {/* Financial Breakdown Card */}
      <Card style={styles.card}>
        <Text style={styles.cardSectionTitle}>Thông tin thanh toán</Text>
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Số tiền đã trả</Text>
          <Text style={styles.financePrice}>
            {appointment.paidAmountVnd.toLocaleString('vi-VN')} ₫
          </Text>
        </View>
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Phương thức</Text>
          <Text style={styles.financeValue}>payOS (VietQR / Chuyển khoản)</Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        {appointment.canConfirmCompletion && onConfirmCompletion && (
          <PrimaryButton label="Xác nhận buổi tập đã hoàn thành" onPress={onConfirmCompletion} />
        )}

        {appointment.canDispute && onDisputeCompletion && (
          <SecondaryButton label="Báo cáo vấn đề với buổi tập" onPress={onDisputeCompletion} />
        )}
        {appointment.canReview && onReviewPt && (
          <PrimaryButton label="Đánh giá huấn luyện viên" onPress={onReviewPt} />
        )}

        {appointment.canReschedule && onReschedule && (
          <SecondaryButton label="Đổi lịch tập" onPress={onReschedule} />
        )}

        {appointment.canCancel && onCancelBooking && (
          <SecondaryButton label="Hủy lịch hẹn & Hoàn tiền" onPress={onCancelBooking} />
        )}

        {onContactSupport && (
          <SecondaryButton label="Yêu cầu hỗ trợ" onPress={onContactSupport} />
        )}
      </View>
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
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  bookingCodeLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bookingCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badgesCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coachInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  coachTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  detailLineText: {
    flex: 1,
  },
  detailLineLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  detailLineValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 1,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  financeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  financePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  financeValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
