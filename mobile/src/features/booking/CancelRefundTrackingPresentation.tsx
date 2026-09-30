import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { RefundTrackingViewModel } from './bookingTypes';

export interface CancelRefundTrackingPresentationProps {
  refundData?: RefundTrackingViewModel;
  bookingCode: string;
  paidAmountVnd: number;
  eligibleRefundAmountVnd: number;
  onConfirmCancel: (reason: string) => void;
  onContactSupport?: () => void;
}

const CANCEL_REASONS = [
  'Thay đổi lịch trình cá nhân',
  'Lý do sức khỏe đột xuất',
  'Huấn luyện viên đề xuất dời lịch',
  'Lý do khác',
];

export function CancelRefundTrackingPresentation({
  refundData,
  bookingCode,
  paidAmountVnd,
  eligibleRefundAmountVnd,
  onConfirmCancel,
  onContactSupport,
}: CancelRefundTrackingPresentationProps) {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  const isSubmitted = !!refundData;

  const handleCancel = () => {
    const finalReason =
      selectedReason === 'Lý do khác' ? customReason.trim() || 'Lý do khác' : selectedReason;
    onConfirmCancel(finalReason);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* If already submitted, show refund tracking status */}
      {isSubmitted && refundData ? (
        <View style={styles.trackingContainer}>
          <Card style={styles.card}>
            <View style={styles.statusHeader}>
              <View style={styles.iconCirclePending}>
                <Clock size={28} color="#D97706" />
              </View>
              <Text style={styles.statusTitle}>Yêu cầu hoàn tiền đang xử lý</Text>
              <Text style={styles.statusDesc}>
                Yêu cầu hủy lịch #{bookingCode} đã được ghi nhận vào sổ cái hệ thống. Tiền hoàn
                dự kiến sẽ chuyển về tài khoản thanh toán ban đầu.
              </Text>
            </View>

            {/* Financial Details */}
            <View style={styles.infoBox}>
              <View style={styles.row}>
                <Text style={styles.label}>Số tiền gốc đã thanh toán</Text>
                <Text style={styles.value}>{paidAmountVnd.toLocaleString('vi-VN')} ₫</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Số tiền hoàn hợp lệ</Text>
                <Text style={styles.highlightPrice}>
                  {refundData.refundAmountVnd.toLocaleString('vi-VN')} ₫
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Thời gian gửi yêu cầu</Text>
                <Text style={styles.value}>{refundData.requestedAt}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Lý do hủy</Text>
                <Text style={styles.value}>{refundData.reason}</Text>
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <CheckCircle2 size={18} color="#16A34A" />
                <View style={styles.timelineTextCol}>
                  <Text style={styles.timelineTitle}>Gửi yêu cầu hủy lịch</Text>
                  <Text style={styles.timelineSub}>{refundData.requestedAt}</Text>
                </View>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <Clock size={18} color="#D97706" />
                <View style={styles.timelineTextCol}>
                  <Text style={styles.timelineTitle}>Đang đối soát &amp; xử lý hoàn tiền</Text>
                  <Text style={styles.timelineSub}>Dự kiến 1 - 3 ngày làm việc qua ngân hàng</Text>
                </View>
              </View>
            </View>
          </Card>

          {onContactSupport && (
            <SecondaryButton label="Hỗ trợ & Khiếu nại" onPress={onContactSupport} />
          )}
        </View>
      ) : (
        /* Cancellation Request Form */
        <View style={styles.formContainer}>
          <Card style={styles.card}>
            <View style={styles.warningBox}>
              <ShieldAlert size={20} color="#D97706" />
              <View style={styles.warningTextCol}>
                <Text style={styles.warningTitle}>Chính sách hoàn tiền Fitmate</Text>
                <Text style={styles.warningDesc}>
                  Hủy trước 24 giờ được hoàn 100% số tiền thực trả. Hủy sau 24 giờ áp dụng chính
                  sách bồi hoàn một phần theo quy định nền tảng.
                </Text>
              </View>
            </View>

            <View style={styles.refundEstimateBox}>
              <Text style={styles.estimateLabel}>Số tiền dự kiến hoàn trả:</Text>
              <Text style={styles.estimateValue}>
                {eligibleRefundAmountVnd.toLocaleString('vi-VN')} ₫
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Chọn lý do hủy lịch:</Text>
            <View style={styles.reasonsList}>
              {CANCEL_REASONS.map((r) => {
                const isSelected = r === selectedReason;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                    onPress={() => setSelectedReason(r)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={r}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text
                      style={[styles.reasonText, isSelected && styles.reasonTextSelected]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedReason === 'Lý do khác' && (
              <TextInput
                style={styles.textInput}
                placeholder="Nhập lý do cụ thể..."
                placeholderTextColor={colors.textMuted}
                value={customReason}
                onChangeText={setCustomReason}
              />
            )}
          </Card>

          <View style={styles.actionGroup}>
            <PrimaryButton label="Xác nhận hủy & Gửi yêu cầu hoàn tiền" onPress={handleCancel} />
          </View>
        </View>
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
  trackingContainer: {
    gap: spacing.md,
  },
  formContainer: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statusHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  iconCirclePending: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statusDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  highlightPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
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
  timelineTextCol: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timelineSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  warningDesc: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
    marginTop: 2,
  },
  refundEstimateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  estimateLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  estimateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reasonsList: {
    gap: spacing.xs,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonOptionSelected: {
    backgroundColor: '#E6F4F1',
    borderColor: colors.primary,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  reasonText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  reasonTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
  },
  actionGroup: {
    marginTop: spacing.xs,
  },
});
