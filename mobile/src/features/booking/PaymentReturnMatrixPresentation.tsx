import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';

export type PaymentReturnStatus = 'verifying' | 'success' | 'failed' | 'canceled' | 'uncertain';

export interface PaymentReturnMatrixPresentationProps {
  status: PaymentReturnStatus;
  bookingCode: string;
  amountVnd: number;
  coachName?: string;
  serviceName?: string;
  scheduledTime?: string;
  errorMessage?: string;
  onViewAppointment: () => void;
  onRetryOrChooseAgain: () => void;
  onContactSupport?: () => void;
  onRecheckStatus?: () => void;
}

export function PaymentReturnMatrixPresentation({
  status,
  bookingCode,
  amountVnd,
  coachName,
  serviceName,
  scheduledTime,
  errorMessage,
  onViewAppointment,
  onRetryOrChooseAgain,
  onContactSupport,
  onRecheckStatus,
}: PaymentReturnMatrixPresentationProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Webhook Gateway Notice */}
      <View style={styles.topNotice}>
        <ShieldCheck size={18} color={colors.primary} />
        <View style={styles.topNoticeTextCol}>
          <Text style={styles.topNoticeTitle}>Đồng bộ tự động cổng payOS</Text>
          <Text style={styles.topNoticeSub}>
            Trạng thái phản ánh từ kết quả xử lý webhook chính thức của máy chủ
          </Text>
        </View>
      </View>

      {/* VERIFYING STATE */}
      {status === 'verifying' && (
        <Card style={styles.stateCard}>
          <View style={styles.spinnerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <View style={styles.statusBadgeVerifying}>
            <Text style={styles.statusBadgeTextVerifying}>Đang xác minh giao dịch</Text>
          </View>
          <Text style={styles.stateTitle}>Đang chờ tín hiệu xác thực từ payOS &amp; Ngân hàng</Text>
          <Text style={styles.stateDesc}>
            Hệ thống đang kiểm tra trạng thái thanh toán từ máy chủ. Vui lòng không đóng ứng dụng
            hoặc làm mới trang.
          </Text>

          <View style={styles.infoStrip}>
            <View>
              <Text style={styles.infoStripLabel}>Mã đơn đặt lịch</Text>
              <Text style={styles.infoStripValue}>#{bookingCode}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.infoStripLabel}>Số tiền</Text>
              <Text style={styles.infoStripPrice}>{amountVnd.toLocaleString('vi-VN')} ₫</Text>
            </View>
          </View>

          {onRecheckStatus && (
            <View style={styles.recheckBtnRow}>
              <SecondaryButton label="Kiểm tra lại trạng thái" onPress={onRecheckStatus} />
            </View>
          )}
        </Card>
      )}

      {/* SUCCESS STATE */}
      {status === 'success' && (
        <Card style={styles.stateCard}>
          <View style={styles.successIconCircle}>
            <CheckCircle2 size={48} color="#16A34A" />
          </View>
          <View style={styles.statusBadgeSuccess}>
            <Text style={styles.statusBadgeTextSuccess}>Thanh toán hoàn tất</Text>
          </View>
          <Text style={styles.stateTitle}>Đặt lịch thành công!</Text>
          <Text style={styles.stateDesc}>
            Buổi tập của bạn đã được xác nhận. Huấn luyện viên đã nhận thông báo và chuẩn bị giáo án
            cho bạn.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã lịch hẹn</Text>
              <Text style={styles.detailValue}>#{bookingCode}</Text>
            </View>
            {coachName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Huấn luyện viên</Text>
                <Text style={styles.detailValue}>{coachName}</Text>
              </View>
            )}
            {serviceName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dịch vụ</Text>
                <Text style={styles.detailValue}>{serviceName}</Text>
              </View>
            )}
            {scheduledTime && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thời gian</Text>
                <Text style={styles.detailValue}>{scheduledTime}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tiền đã trả</Text>
              <Text style={styles.detailPrice}>{amountVnd.toLocaleString('vi-VN')} ₫</Text>
            </View>
          </View>

          <View style={styles.actionGroup}>
            <PrimaryButton label="Xem chi tiết lịch hẹn" onPress={onViewAppointment} />
          </View>
        </Card>
      )}

      {/* FAILED / CANCELED / UNCERTAIN STATE */}
      {(status === 'failed' || status === 'canceled' || status === 'uncertain') && (
        <Card style={styles.stateCard}>
          <View
            style={[
              styles.errorIconCircle,
              status === 'uncertain' && { backgroundColor: '#FEF3C7' },
            ]}
          >
            {status === 'uncertain' ? (
              <AlertTriangle size={48} color="#D97706" />
            ) : (
              <XCircle size={48} color="#DC2626" />
            )}
          </View>

          <View
            style={[
              styles.statusBadgeFailed,
              status === 'uncertain' && { backgroundColor: '#FEF3C7' },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeTextFailed,
                status === 'uncertain' && { color: '#B45309' },
              ]}
            >
              {status === 'canceled'
                ? 'Đã hủy thanh toán'
                : status === 'uncertain'
                ? 'Trạng thái chưa xác định'
                : 'Thanh toán thất bại'}
            </Text>
          </View>

          <Text style={styles.stateTitle}>
            {status === 'canceled'
              ? 'Giao dịch đã được hủy'
              : status === 'uncertain'
              ? 'Đang chờ xác nhận thêm từ ngân hàng'
              : 'Giao dịch chưa được hoàn tất'}
          </Text>

          <Text style={styles.stateDesc}>
            {errorMessage ||
              (status === 'canceled'
                ? 'Bạn đã hủy quá trình thanh toán trên cổng payOS. Khung giờ đã được giải phóng.'
                : status === 'uncertain'
                ? 'Giao dịch có thể mất vài phút để ghi nhận. Vui lòng kiểm tra lại trước khi thanh toán lại để tránh bị trừ tiền 2 lần.'
                : 'Cổng thanh toán phản hồi không thành công hoặc phiên giữ chỗ đã hết hạn.')}
          </Text>

          <View style={styles.actionGroup}>
            {status === 'uncertain' && onRecheckStatus ? (
              <PrimaryButton label="Kiểm tra lại trạng thái" onPress={onRecheckStatus} />
            ) : (
              <PrimaryButton label="Đặt lịch lại" onPress={onRetryOrChooseAgain} />
            )}
            {onContactSupport && (
              <SecondaryButton label="Hỗ trợ & Phản ánh" onPress={onContactSupport} />
            )}
          </View>
        </Card>
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
  topNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F0FDFA',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  topNoticeTextCol: {
    flex: 1,
  },
  topNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  topNoticeSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stateCard: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  spinnerBox: {
    paddingVertical: spacing.md,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeVerifying: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusBadgeTextVerifying: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusBadgeTextSuccess: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  statusBadgeFailed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusBadgeTextFailed: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stateDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoStrip: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  infoStripLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  infoStripValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  infoStripPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  recheckBtnRow: {
    width: '100%',
    marginTop: spacing.xs,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  actionGroup: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
