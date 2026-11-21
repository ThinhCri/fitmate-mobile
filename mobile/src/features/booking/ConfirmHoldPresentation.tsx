import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Timer, Calendar, MapPin, QrCode, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { BookingHoldQuoteViewModel } from './bookingTypes';

export interface ConfirmHoldPresentationProps {
  quote: BookingHoldQuoteViewModel;
  isProcessing?: boolean;
  onPayPayOS: () => void;
  onCancelHold: () => void;
}

export function ConfirmHoldPresentation({
  quote,
  isProcessing = false,
  onPayPayOS,
  onCancelHold,
}: ConfirmHoldPresentationProps) {
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hold Timer Alert Banner */}
      <View style={styles.holdBanner}>
        <View style={styles.holdIconCircle}>
          <Timer size={22} color="#D97706" />
        </View>
        <View style={styles.holdTextCol}>
          <View style={styles.holdTitleRow}>
            <Text style={styles.holdTitle}>Khung giờ đang tạm giữ:</Text>
            <View style={styles.timerBadge}>
              <Text style={styles.timerBadgeText}>
                {formatCountdown(quote.remainingSeconds)}
              </Text>
            </View>
          </View>
          <Text style={styles.holdSubtitle}>
            Vui lòng hoàn tất thanh toán trước khi thời gian giữ chỗ kết thúc để giữ giờ tập này.
          </Text>
        </View>
      </View>

      {/* Card 1: Session Information */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Thông tin buổi tập</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Đã giữ chỗ</Text>
          </View>
        </View>

        <View style={styles.coachSummaryBox}>
          <View style={styles.coachAvatar}>
            <Text style={styles.avatarInitial}>{quote.coach.name.charAt(0)}</Text>
          </View>
          <View style={styles.coachDetails}>
            <Text style={styles.coachName}>{quote.coach.name}</Text>
            <Text style={styles.serviceName}>{quote.service.name}</Text>
          </View>
        </View>

        <View style={styles.infoLine}>
          <Calendar size={16} color={colors.primary} />
          <View style={styles.infoLineTextCol}>
            <Text style={styles.infoLineLabel}>Thời gian đào tạo</Text>
            <Text style={styles.infoLineValue}>
              {quote.selectedTimeSlot} • {quote.selectedDate}
            </Text>
          </View>
        </View>

        {quote.location ? <View style={styles.infoLine}>
          <MapPin size={16} color={colors.primary} />
          <View style={styles.infoLineTextCol}>
            <Text style={styles.infoLineLabel}>Địa điểm tập luyện</Text>
            <Text style={styles.infoLineValue}>{quote.location}</Text>
          </View>
        </View> : null}
      </Card>

      {/* Card 2: Payment Breakdown */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Giá dịch vụ PT ({quote.service.durationMinutes} phút)</Text>
          <Text style={styles.breakdownValue}>
            {quote.servicePriceVnd.toLocaleString('vi-VN')} ₫
          </Text>
        </View>

        {quote.platformFeeVnd > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Phí nền tảng Fitmate</Text>
            <Text style={styles.breakdownValue}>
              {quote.platformFeeVnd.toLocaleString('vi-VN')} ₫
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalValue}>{quote.totalVnd.toLocaleString('vi-VN')} ₫</Text>
        </View>
      </Card>

      {/* Card 3: Payment Method */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Cổng thanh toán</Text>

        <View style={styles.payOptionBox}>
          <View style={styles.payIconBox}>
            <QrCode size={24} color={colors.primary} />
          </View>
          <View style={styles.payOptionDetails}>
            <Text style={styles.payOptionTitle}>Cổng thanh toán payOS</Text>
            <Text style={styles.payOptionSub}>
              Mã QR VietQR đa ngân hàng, chuyển khoản an toàn xác thực tức thì
            </Text>
          </View>
          <ShieldCheck size={20} color="#16A34A" />
        </View>
      </Card>

      {/* Cancellation Policy Notice */}
      <View style={styles.policyBox}>
        <AlertCircle size={16} color={colors.textSecondary} />
        <Text style={styles.policyText}>
          Chính sách hủy lịch: Bạn có thể hủy và yêu cầu hoàn tiền trước buổi tập ít nhất 48 giờ. Tiền hoàn
          sẽ được ghi nhận vào lịch sử giao dịch minh bạch.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <PrimaryButton
          label={`Thanh toán ${quote.totalVnd.toLocaleString('vi-VN')} ₫ qua payOS`}
          loading={isProcessing}
          onPress={onPayPayOS}
        />
        <SecondaryButton label="Hủy giữ chỗ" onPress={onCancelHold} />
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
  holdBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  holdIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdTextCol: {
    flex: 1,
    gap: 2,
  },
  holdTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  holdTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  timerBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.md,
  },
  timerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    fontVariant: ['tabular-nums'],
  },
  holdSubtitle: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  coachSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: 4,
  },
  infoLineTextCol: {
    flex: 1,
  },
  infoLineLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  infoLineValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  payOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F0FDFA',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  payIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payOptionDetails: {
    flex: 1,
  },
  payOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  payOptionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  policyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: 4,
  },
  policyText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
