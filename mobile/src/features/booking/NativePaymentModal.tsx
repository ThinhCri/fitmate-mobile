import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Linking,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Copy,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Building2,
} from 'lucide-react-native';
import { ModalShell } from '@/components/design-system/ModalShell';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { bookingService } from '@/services/api/bookingService';
import type { PaymentWire } from '@/services/api/types';

export interface NativePaymentModalProps {
  visible: boolean;
  payment: PaymentWire | null;
  remainingSeconds?: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onCancelHold?: () => void;
}

export function NativePaymentModal({
  visible,
  payment,
  remainingSeconds = 300,
  onClose,
  onPaymentSuccess,
  onCancelHold,
}: NativePaymentModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isPaidRef = useRef(false);

  const bin = payment?.bin || '970422'; // Default MBBank
  const acc = payment?.account_number || '';
  const amount = payment?.amount_vnd || 0;
  const desc = payment?.description || 'FITMATE';
  const name = payment?.account_name || 'FITMATE';

  const qrImageUrl = payment?.qr_code?.startsWith('http')
    ? payment.qr_code
    : payment?.qr_code
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payment.qr_code)}`
    : acc
    ? `https://qr.sepay.vn/img?bank=MBBank&acc=${acc}&amount=${amount}&des=${encodeURIComponent(desc)}`
    : '';

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [payment?.id]);

  // Polling payment status every 3.5 seconds
  const checkStatus = useCallback(async (silent = true) => {
    if (!payment?.id || isPaidRef.current) return;
    if (!silent) setChecking(true);
    try {
      const updated = await bookingService.getMyPayment(payment.id);
      if (updated.status === 'Paid') {
        isPaidRef.current = true;
        Alert.alert('Thành công', 'Thanh toán đã được ghi nhận thành công!', [
          { text: 'Tiếp tục', onPress: onPaymentSuccess },
        ]);
        return;
      }
      if (!silent) {
        Alert.alert(
          'Chưa ghi nhận tiền về',
          'Hệ thống đang tiếp tục kiểm tra giao dịch từ ngân hàng. Vui lòng đợi trong giây lát sau khi bạn đã chuyển khoản thành công.'
        );
      }
    } catch {
      if (!silent) {
        Alert.alert('Thông báo', 'Chưa thể kiểm tra trạng thái lúc này. Vui lòng thử lại.');
      }
    } finally {
      if (!silent) setChecking(false);
    }
  }, [payment, onPaymentSuccess]);

  useEffect(() => {
    if (!visible || !payment?.id) return;
    isPaidRef.current = false;
    const interval = setInterval(() => {
      void checkStatus(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [visible, payment?.id, checkStatus]);

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      Alert.alert('Thông báo', `Không thể sao chép ${label}.`);
    }
  };

  const handleSaveQR = async () => {
    if (!qrImageUrl) {
      if (payment?.redirect_url) {
        void Linking.openURL(payment.redirect_url);
      } else {
        Alert.alert('Thông báo', 'Chưa có ảnh mã QR để lưu.');
      }
      return;
    }
    try {
      const fileUri = `${FileSystem.cacheDirectory}fitmate_vietqr_${Date.now()}.png`;
      const downloadRes = await FileSystem.downloadAsync(qrImageUrl, fileUri);
      if (downloadRes.status === 200) {
        await Share.share({
          url: downloadRes.uri,
          message: `Mã thanh toán Fitmate: ${amount.toLocaleString('vi-VN')} đ cho buổi tập.`,
        });
      } else {
        await Share.share({
          url: qrImageUrl,
          message: `Mã thanh toán Fitmate: ${amount.toLocaleString('vi-VN')} đ.`,
        });
      }
    } catch {
      Alert.alert('Chia sẻ mã QR', 'Bạn có thể chụp màn hình mã QR này để quét trên app ngân hàng.');
    }
  };

  const handleOpenBankApp = () => {
    Alert.alert(
      'Mở ứng dụng Ngân hàng',
      'Vui lòng mở ứng dụng ngân hàng của bạn (Vietcombank, MB, Techcombank, VPBank...) và chọn tính năng "Quét QR" để hoàn tất thanh toán.',
      [
        { text: 'Đã hiểu' },
        {
          text: 'Mở qua Web PayOS',
          onPress: () => {
            if (payment?.redirect_url) void Linking.openURL(payment.redirect_url);
          },
        },
      ]
    );
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Thanh toán VietQR"
      position="bottom"
    >
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Countdown Banner */}
        <View style={styles.countdownBanner}>
          <Clock size={16} color={colors.warning} />
          <Text style={styles.countdownText}>
            Thời gian giữ chỗ còn lại:{' '}
            <Text style={styles.countdownBold}>{formatCountdown(remainingSeconds)}</Text>
          </Text>
        </View>

        {/* QR Code Container */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            {!acc ? (
              <View style={styles.qrErrorBox}>
                <AlertCircle size={32} color={colors.warning} />
                <Text style={styles.qrErrorTitle}>Chưa có mã QR trực tiếp</Text>
                <Text style={styles.qrErrorSubtitle}>
                  Chưa nhận được thông tin số tài khoản từ server. Bạn có thể mở cổng thanh toán PayOS để thanh toán ngay.
                </Text>
                {payment?.redirect_url && (
                  <TouchableOpacity
                    style={styles.openWebBtn}
                    onPress={() => void Linking.openURL(payment.redirect_url!)}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={14} color="#FFFFFF" />
                    <Text style={styles.openWebBtnText}>Mở trang PayOS</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : imageError ? (
              <View style={styles.qrErrorBox}>
                <AlertCircle size={32} color={colors.danger} />
                <Text style={styles.qrErrorTitle}>Không thể tải mã QR</Text>
                <Text style={styles.qrErrorSubtitle}>
                  Không tải được ảnh từ dịch vụ VietQR. Vui lòng mở cổng thanh toán PayOS để thanh toán.
                </Text>
                {payment?.redirect_url && (
                  <TouchableOpacity
                    style={styles.openWebBtn}
                    onPress={() => void Linking.openURL(payment.redirect_url!)}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={14} color="#FFFFFF" />
                    <Text style={styles.openWebBtnText}>Mở trang PayOS</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {!imageLoaded && (
                  <View style={styles.qrLoading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.qrLoadingText}>Đang tạo mã VietQR...</Text>
                  </View>
                )}
                <Image
                  source={{ uri: qrImageUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageLoaded(true);
                    setImageError(true);
                  }}
                />
              </>
            )}
          </View>

          {!!acc && !imageError && (
            <View style={styles.qrActions}>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={handleSaveQR}
                activeOpacity={0.7}
              >
                <Download size={14} color={colors.primary} />
                <Text style={styles.actionChipText}>Lưu mã QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionChip}
                onPress={handleOpenBankApp}
                activeOpacity={0.7}
              >
                <Building2 size={14} color={colors.primary} />
                <Text style={styles.actionChipText}>Mở App Ngân hàng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Transfer Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thông tin chuyển khoản</Text>

          {/* Account Number */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Số tài khoản</Text>
              <Text style={styles.infoValueBold}>{acc || '(Cần cập nhật server)'}</Text>
            </View>
            {!!acc && (
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(acc, 'acc', 'Số tài khoản')}
                activeOpacity={0.7}
              >
                {copiedKey === 'acc' ? (
                  <CheckCircle2 size={16} color={colors.success} />
                ) : (
                  <Copy size={16} color={colors.primary} />
                )}
                <Text
                  style={[
                    styles.copyBtnText,
                    copiedKey === 'acc' && { color: colors.success },
                  ]}
                >
                  {copiedKey === 'acc' ? 'Đã chép' : 'Sao chép'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Account Name */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Chủ tài khoản</Text>
              <Text style={styles.infoValue}>{name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Amount */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Số tiền thanh toán</Text>
              <Text style={[styles.infoValueBold, { color: colors.primary }]}>
                {amount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyToClipboard(amount.toString(), 'amount', 'Số tiền')}
              activeOpacity={0.7}
            >
              {copiedKey === 'amount' ? (
                <CheckCircle2 size={16} color={colors.success} />
              ) : (
                <Copy size={16} color={colors.primary} />
              )}
              <Text
                style={[
                  styles.copyBtnText,
                  copiedKey === 'amount' && { color: colors.success },
                ]}
              >
                {copiedKey === 'amount' ? 'Đã chép' : 'Sao chép'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Nội dung chuyển khoản</Text>
              <Text style={[styles.infoValueBold, styles.descHighlight]}>{desc}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyToClipboard(desc, 'desc', 'Nội dung')}
              activeOpacity={0.7}
            >
              {copiedKey === 'desc' ? (
                <CheckCircle2 size={16} color={colors.success} />
              ) : (
                <Copy size={16} color={colors.primary} />
              )}
              <Text
                style={[
                  styles.copyBtnText,
                  copiedKey === 'desc' && { color: colors.success },
                ]}
              >
                {copiedKey === 'desc' ? 'Đã chép' : 'Sao chép'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <ShieldCheck size={16} color={colors.success} style={{ marginTop: 2 }} />
          <Text style={styles.noteText}>
            Hệ thống sẽ tự động xác nhận đơn ngay khi tiền vào tài khoản. Vui lòng giữ nguyên nội dung chuyển khoản để đối soát chính xác.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGroup}>
          <PrimaryButton
            label={checking ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản xong'}
            onPress={() => void checkStatus(false)}
            loading={checking}
          />

          {payment?.redirect_url && (
            <TouchableOpacity
              style={styles.fallbackWebBtn}
              onPress={() => void Linking.openURL(payment.redirect_url!)}
            >
              <ExternalLink size={14} color={colors.textSecondary} />
              <Text style={styles.fallbackWebText}>Mở qua cổng thanh toán PayOS (Web)</Text>
            </TouchableOpacity>
          )}

          {onCancelHold && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancelHold}>
              <AlertCircle size={14} color={colors.danger} />
              <Text style={styles.cancelBtnText}>Hủy giữ chỗ này</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 560,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warningLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  countdownText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  countdownBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: spacing.md,
  },
  qrWrapper: {
    width: 230,
    height: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 214,
    height: 214,
  },
  qrLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    zIndex: 1,
    gap: spacing.sm,
  },
  qrLoadingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  qrErrorBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: 4,
  },
  qrErrorTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontSize: 13,
  },
  qrErrorSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    fontSize: 11,
  },
  openWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginTop: 4,
  },
  openWebBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
  qrActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.title3,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  infoValue: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  infoValueBold: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  descHighlight: {
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 4,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    gap: spacing.xs + 2,
  },
  noteText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  actionGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  fallbackWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  fallbackWebText: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  cancelBtnText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
});
