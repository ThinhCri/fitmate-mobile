import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DollarSign, ShieldCheck, CheckCircle2, Clock, Landmark, AlertCircle } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { SecondaryButton } from '@/components/design-system/Buttons';

export interface PtPayoutDetailPresentationProps {
  bookingCode: string;
  clientName: string;
  serviceName: string;
  completedAt: string;
  grossAmountVnd: number;
  platformFee10Vnd: number;
  ptShare90Vnd: number;
  refundAdjustedVnd?: number;
  payoutStatus: 'pending' | 'on_hold' | 'approved' | 'paid_out';
  maskedBankInfo?: string;
  referenceNumber?: string;
  onContactSupport?: () => void;
}

export function PtPayoutDetailPresentation({
  bookingCode,
  clientName,
  serviceName,
  completedAt,
  grossAmountVnd,
  platformFee10Vnd,
  ptShare90Vnd,
  refundAdjustedVnd = 0,
  payoutStatus,
  maskedBankInfo = 'Vietcombank •••• 5678 (Chính chủ HLV)',
  referenceNumber = 'PAY-20260928-8921',
  onContactSupport,
}: PtPayoutDetailPresentationProps) {
  const getStatusText = (status: PtPayoutDetailPresentationProps['payoutStatus']) => {
    switch (status) {
      case 'paid_out':
        return 'Đã chuyển tiền vào tài khoản';
      case 'approved':
        return 'Đã duyệt chi — Chờ ngân hàng đối soát';
      case 'on_hold':
        return 'Tạm giữ đối soát khiếu nại';
      default:
        return 'Đang chờ xác minh sau buổi dạy';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Context Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topCodeLabel}>Mã quyết toán</Text>
          <Text style={styles.topCode}>#{referenceNumber}</Text>
        </View>

        <View style={styles.badgeSuccess}>
          <Text style={styles.badgeSuccessText}>
            {payoutStatus === 'paid_out' ? 'Đã chi trả' : 'Đang xử lý'}
          </Text>
        </View>
      </View>

      {/* Main Financial Split Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Phân bổ tài chính buổi tập</Text>

        <View style={styles.amountHero}>
          <Text style={styles.amountLabel}>Phần HLV nhận thực tế (90%)</Text>
          <Text style={styles.amountValue}>{ptShare90Vnd.toLocaleString('vi-VN')} ₫</Text>
        </View>

        <View style={styles.splitBox}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Giá trị đơn hàng (GMV)</Text>
            <Text style={styles.rowValue}>{grossAmountVnd.toLocaleString('vi-VN')} ₫</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phí nền tảng Fitmate (10%)</Text>
            <Text style={[styles.rowValue, { color: '#D97706' }]}>
              -{platformFee10Vnd.toLocaleString('vi-VN')} ₫
            </Text>
          </View>

          {refundAdjustedVnd > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Khấu trừ hoàn tiền / Tranh chấp</Text>
              <Text style={[styles.rowValue, { color: '#DC2626' }]}>
                -{refundAdjustedVnd.toLocaleString('vi-VN')} ₫
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalRowLabel}>Tổng cộng PT nhận</Text>
            <Text style={styles.totalRowValue}>{ptShare90Vnd.toLocaleString('vi-VN')} ₫</Text>
          </View>
        </View>
      </Card>

      {/* Status Timeline */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Tiến trình quyết toán</Text>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <CheckCircle2 size={18} color="#16A34A" />
            <View style={styles.timelineCol}>
              <Text style={styles.timelineHeading}>Buổi dạy hoàn thành</Text>
              <Text style={styles.timelineTime}>{completedAt}</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <CheckCircle2
              size={18}
              color={payoutStatus !== 'pending' ? '#16A34A' : colors.textMuted}
            />
            <View style={styles.timelineCol}>
              <Text style={styles.timelineHeading}>Quản trị viên đối soát &amp; Duyệt chi</Text>
              <Text style={styles.timelineTime}>
                {payoutStatus !== 'pending' ? 'Đã xác nhận đạt chuẩn' : 'Đang trong phiên đối soát'}
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <Clock
              size={18}
              color={payoutStatus === 'paid_out' ? '#16A34A' : '#D97706'}
            />
            <View style={styles.timelineCol}>
              <Text style={styles.timelineHeading}>
                {payoutStatus === 'paid_out'
                  ? 'Chuyển khoản thành công'
                  : 'Đang chuyển về tài khoản'}
              </Text>
              <Text style={styles.timelineTime}>{getStatusText(payoutStatus)}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Payee Details */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Tài khoản thụ hưởng</Text>
        <View style={styles.bankRow}>
          <Landmark size={20} color={colors.primary} />
          <Text style={styles.bankText}>{maskedBankInfo}</Text>
        </View>
      </Card>

      {/* Support action */}
      {onContactSupport && (
        <SecondaryButton label="Thắc mắc về khoản chi này" onPress={onContactSupport} />
      )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  topCodeLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  topCode: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeSuccessText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  amountHero: {
    backgroundColor: '#F0FDFA',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 2,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  splitBox: {
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalRowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalRowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  timeline: {
    paddingVertical: spacing.xs,
    gap: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  timelineCol: {
    flex: 1,
  },
  timelineHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timelineTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 8,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  bankText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
