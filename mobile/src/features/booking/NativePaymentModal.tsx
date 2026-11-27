import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  AppState,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Linking,
  Platform,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import Svg, { Path, Rect } from 'react-native-svg';
import { buildQrPngBase64, buildQrSvgData, buildVietQrFallback } from './qrPngGenerator';
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

function parseVietQrEmvco(qr?: string | null): { bin?: string; acc?: string } {
  if (!qr) return {};
  try {
    let idx = 0;
    const tags: Record<string, string> = {};
    while (idx < qr.length - 4) {
      const id = qr.slice(idx, idx + 2);
      const len = parseInt(qr.slice(idx + 2, idx + 4), 10);
      if (isNaN(len) || len <= 0 || idx + 4 + len > qr.length) break;
      tags[id] = qr.slice(idx + 4, idx + 4 + len);
      idx += 4 + len;
    }
    let acc: string | undefined;
    let bin: string | undefined;
    if (tags['38']) {
      const t38 = tags['38'];
      let i = 0;
      while (i < t38.length - 4) {
        const subId = t38.slice(i, i + 2);
        const subLen = parseInt(t38.slice(i + 2, i + 4), 10);
        if (isNaN(subLen) || subLen <= 0 || i + 4 + subLen > t38.length) break;
        const subVal = t38.slice(i + 4, i + 4 + subLen);
        if (subId === '01') {
          let j = 0;
          while (j < subVal.length - 4) {
            const sId = subVal.slice(j, j + 2);
            const sLen = parseInt(subVal.slice(j + 2, j + 4), 10);
            if (isNaN(sLen) || sLen <= 0 || j + 4 + sLen > subVal.length) break;
            const sVal = subVal.slice(j + 4, j + 4 + sLen);
            if (sId === '00') bin = sVal;
            if (sId === '01') acc = sVal;
            j += 4 + sLen;
          }
        }
        i += 4 + subLen;
      }
    }
    return { bin, acc };
  } catch {
    return {};
  }
}

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
  const [savingQr, setSavingQr] = useState(false);
  const isPaidRef = useRef(false);
  const inFlightRef = useRef(false);

  const parsed = useMemo(() => parseVietQrEmvco(payment?.qr_code), [payment?.qr_code]);
  const bin = payment?.bin || parsed.bin || '';
  const acc = payment?.account_number || parsed.acc || '';
  const amount = payment?.amount_vnd || 0;
  const desc = payment?.description || 'FITMATE';
  const name = payment?.account_name || 'FITMATE';

  const qrHttpUrl = payment?.qr_code?.startsWith('http') ? payment.qr_code : null;
  const rawQrPayload = useMemo(() => {
    if (payment?.qr_code && !payment.qr_code.startsWith('http')) {
      return payment.qr_code;
    }
    return buildVietQrFallback(bin, acc, amount, desc);
  }, [payment?.qr_code, bin, acc, amount, desc]);
  const svgQr = useMemo(() => (rawQrPayload ? buildQrSvgData(rawQrPayload) : null), [rawQrPayload]);
  const hasQrVisual = Boolean(svgQr || (qrHttpUrl && !imageError));

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [payment?.id]);

  const paymentId = payment?.id;

  // Polling payment status every 3.5 seconds + immediate recheck on foreground return
  const checkStatus = useCallback(async (silent = true) => {
    if (!paymentId || isPaidRef.current || inFlightRef.current) return;
    inFlightRef.current = true;
    if (!silent) setChecking(true);
    try {
      const updated = await bookingService.getMyPayment(paymentId);
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
      inFlightRef.current = false;
      if (!silent) setChecking(false);
    }
  }, [paymentId, onPaymentSuccess]);

  useEffect(() => {
    if (!visible || !payment?.id) return;
    isPaidRef.current = false;
    void checkStatus(true);
    const interval = setInterval(() => {
      void checkStatus(true);
    }, 3500);
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void checkStatus(true);
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
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
    if (savingQr) return;
    setSavingQr(true);
    try {
      const suffix = payment?.order_code || payment?.id?.slice(0, 8) || 'payos';
      const baseName = `Fitmate-QR-${suffix}`;
      const fileName = `${baseName}.png`;
      const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      if (!cacheDir) {
        Alert.alert('Lỗi', 'Không truy cập được bộ nhớ tạm để tạo ảnh QR.');
        return;
      }
      const cachePath = `${cacheDir}${fileName}`;
      let base64Png: string | null = null;

      if (rawQrPayload) {
        base64Png = buildQrPngBase64(rawQrPayload, 420);
        await FileSystem.writeAsStringAsync(cachePath, base64Png, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (qrHttpUrl) {
        const dl = await FileSystem.downloadAsync(qrHttpUrl, cachePath);
        base64Png = await FileSystem.readAsStringAsync(dl.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        if (payment?.redirect_url) {
          await Linking.openURL(payment.redirect_url);
        } else {
          Alert.alert('Chưa có mã QR', 'Không tìm thấy dữ liệu QR để lưu.');
        }
        return;
      }

      if (Platform.OS === 'android' && FileSystem.StorageAccessFramework) {
        try {
          const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (perm.granted && base64Png) {
            const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
              perm.directoryUri,
              baseName,
              'image/png'
            );
            await FileSystem.writeAsStringAsync(destUri, base64Png, {
              encoding: FileSystem.EncodingType.Base64,
            });
            Alert.alert(
              'Đã lưu ảnh QR',
              'Ảnh mã QR đã được lưu thành công! Hãy mở ứng dụng ngân hàng và chọn "Quét QR từ ảnh trong thư viện" để thanh toán.'
            );
            return;
          }
        } catch {
          // Fall through to Share sheet if user cancels or SAF rejects
        }
      }

      await Share.share({
        title: fileName,
        url: cachePath,
        message: `Mã QR thanh toán Fitmate (${amount.toLocaleString('vi-VN')}đ · ND: ${desc})`,
      });
    } catch {
      Alert.alert(
        'Không thể lưu ảnh QR',
        'Bạn có thể chụp màn hình mã QR này hoặc mở trang PayOS để thanh toán.'
      );
    } finally {
      setSavingQr(false);
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
            {svgQr ? (
              <Svg
                width={214}
                height={214}
                viewBox={`0 0 ${svgQr.moduleCount} ${svgQr.moduleCount}`}
              >
                <Rect
                  x={0}
                  y={0}
                  width={svgQr.moduleCount}
                  height={svgQr.moduleCount}
                  fill="#FFFFFF"
                />
                <Path d={svgQr.path} fill="#0F172A" />
              </Svg>
            ) : !qrHttpUrl ? (
              <View style={styles.qrErrorBox}>
                <AlertCircle size={32} color={colors.warning} />
                <Text style={styles.qrErrorTitle}>Chưa có mã QR trực tiếp</Text>
                <Text style={styles.qrErrorSubtitle}>
                  Chưa nhận được thông tin mã QR từ server. Bạn có thể mở cổng thanh toán PayOS để thanh toán ngay.
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
                  source={{ uri: qrHttpUrl }}
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

          {hasQrVisual && (
            <>
              <View style={styles.qrActions}>
                <TouchableOpacity
                  style={styles.actionChip}
                  onPress={() => void handleSaveQR()}
                  disabled={savingQr}
                  activeOpacity={0.7}
                >
                  <Download size={14} color={colors.primary} />
                  <Text style={styles.actionChipText} numberOfLines={1}>
                    {savingQr ? 'Đang lưu...' : 'Tải ảnh QR'}
                  </Text>
                </TouchableOpacity>

                {payment?.redirect_url && (
                  <TouchableOpacity
                    style={styles.actionChip}
                    onPress={() => void Linking.openURL(payment.redirect_url!)}
                    activeOpacity={0.7}
                  >
                    <ExternalLink size={14} color={colors.primary} />
                    <Text style={styles.actionChipText} numberOfLines={1}>Mở PayOS Web</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionChip}
                  onPress={handleOpenBankApp}
                  activeOpacity={0.7}
                >
                  <Building2 size={14} color={colors.primary} />
                  <Text style={styles.actionChipText} numberOfLines={1}>Mở App Ngân hàng</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.qrTipText}>
                {'💡 Nhấn Tải ảnh QR để lưu ảnh về máy, rồi mở app ngân hàng chọn quét từ Thư viện ảnh.'}
              </Text>
            </>
          )}
        </View>

        {/* Transfer Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thông tin chuyển khoản</Text>

          {/* Account Number */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Số tài khoản</Text>
              <Text style={styles.infoValueBold}>{acc || '(Xem trên mã QR / PayOS)'}</Text>
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
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
    minHeight: 40,
    maxWidth: '100%',
    flexShrink: 1,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    flexShrink: 1,
  },
  qrTipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    lineHeight: 15,
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
    gap: spacing.sm,
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
