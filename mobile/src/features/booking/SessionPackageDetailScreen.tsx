import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ApiError } from '@/services/api/client';
import { sessionPackageService, type SessionPackageStopPreviewWire, type SessionPackageWire } from '@/services/api/sessionPackageService';

const money = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;
const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit',
  day: '2-digit', month: '2-digit', year: 'numeric',
});
const packageStatus = (value: string) => ({
  Held: 'Đang giữ chỗ', OnlinePreparing: 'Đang chuẩn bị phòng tập',
  PaymentPending: 'Chờ thanh toán', Active: 'Đang hoạt động',
  StopRequested: 'Đang xử lý dừng gói', Stopped: 'Đã dừng',
  Expired: 'Đã hết hạn', LatePaymentRefundPending: 'Chờ xử lý hoàn tiền',
} as Record<string, string>)[value] ?? value;

function newKey(): string {
  return `pkg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function SessionPackageDetailScreen({ id, asPt }: { id: string; asPt: boolean }) {
  const router = useRouter();
  const [item, setItem] = useState<SessionPackageWire | null>(null);
  const [preview, setPreview] = useState<SessionPackageStopPreviewWire | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pendingKey = useRef<{ signature: string; key: string } | null>(null);

  const load = useCallback(async () => {
    if (!id) { setError('Thiếu mã gói tập.'); setLoading(false); return; }
    try {
      setError('');
      setItem(await sessionPackageService.get(id));
    } catch (cause) {
      setItem(null);
      setError(cause instanceof Error ? cause.message : 'Không thể tải gói tập.');
    } finally { setLoading(false); }
  }, [id]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    setPreview(null);
    setReason('');
    pendingKey.current = null;
    void load();
  }, [load]));

  useFocusEffect(useCallback(() => {
    if (item?.status !== 'PaymentPending') return;
    let checks = 0;
    const timer = setInterval(() => {
      checks += 1;
      void load();
      if (checks >= 12) clearInterval(timer);
    }, 5000);
    return () => clearInterval(timer);
  }, [item?.status, load]));

  const keyFor = (signature: string) => {
    if (pendingKey.current?.signature !== signature)
      pendingKey.current = { signature, key: newKey() };
    return pendingKey.current.key;
  };

  const onMutationError = (cause: unknown) => {
    if (cause instanceof ApiError && cause.status === 409) {
      pendingKey.current = null;
      setPreview(null);
      void load();
      Alert.alert('Thông tin đã thay đổi', 'Vui lòng xem lại trạng thái và mức hoàn tiền mới trước khi xác nhận.');
    } else if (cause instanceof ApiError && cause.status === 0) {
      Alert.alert('Chưa rõ kết quả', 'Kết nối bị gián đoạn. Hãy tải lại trạng thái gói trước; nếu cần thử lại, ứng dụng sẽ giữ cùng mã yêu cầu.');
      void load();
    } else {
      Alert.alert('Chưa thực hiện được', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
    }
  };

  const loadPreview = async () => {
    if (busy) return;
    setBusy(true);
    try { setPreview(await sessionPackageService.previewStop(id)); setError(''); }
    catch (cause) { setPreview(null); setError(cause instanceof Error ? cause.message : 'Không thể xem mức hoàn dự kiến.'); }
    finally { setBusy(false); }
  };

  const checkout = () => {
    if (!item || busy || asPt) return;
    const shortNotice = item.sessions.some(session =>
      Date.parse(session.slot_start_utc) < Date.now() + 48 * 60 * 60 * 1000);
    const warning = shortNotice
      ? '\n\nCó buổi bắt đầu trong vòng 48 giờ. Nếu bạn tự bận hoặc vắng mặt, buổi đó không được tự động hoàn tiền hoặc giữ lượt.'
      : '';
    Alert.alert('Xác nhận thanh toán gói',
      `Gói ${item.session_count} buổi: ${money(item.total_price_vnd)}. Sau khi thanh toán, chỉ máy chủ mới xác nhận đã trả tiền.${warning}`,
      [{ text: 'Xem lại', style: 'cancel' }, { text: 'Đến PayOS', onPress: async () => {
        if (busy) return;
        setBusy(true);
        try {
          const result = await sessionPackageService.createPayment(item.id, shortNotice,
            keyFor(`pay:${item.id}:${shortNotice}`));
          if (!result.redirect_url) throw new Error('Chưa có liên kết thanh toán. Hãy tải lại trạng thái gói.');
          const url = new URL(result.redirect_url);
          if (url.protocol !== 'https:' || !/(^|\.)payos\.vn$/.test(url.hostname))
            throw new Error('Liên kết thanh toán không hợp lệ.');
          await Linking.openURL(result.redirect_url);
          await load();
        } catch (cause) { onMutationError(cause); }
        finally { setBusy(false); }
      } }]);
  };

  const submit = () => {
    if (!preview || busy) return;
    const trimmed = reason.trim();
    if (trimmed.length < 10 || trimmed.length > 1000) {
      Alert.alert('Cần nhập lý do', 'Vui lòng nhập lý do từ 10 đến 1000 ký tự.');
      return;
    }
    Alert.alert('Xác nhận yêu cầu dừng gói',
      `Dự kiến hoàn ${money(preview.refund_quote_vnd)} cho các buổi đủ điều kiện. PT có 24 giờ phản hồi. Tiền chưa được chuyển ở bước này. Bạn muốn gửi yêu cầu?`, [
        { text: 'Xem lại', style: 'cancel' },
        { text: 'Gửi yêu cầu', onPress: async () => {
          if (busy) return;
          setBusy(true);
          try {
            const signature = `request:${id}:${trimmed}:${preview.refund_quote_vnd}`;
            const accepted = await sessionPackageService.requestStop(id, trimmed,
              preview.refund_quote_vnd, keyFor(signature));
            pendingKey.current = null;
            setPreview(null);
            Alert.alert('Đã gửi yêu cầu', `Số tiền hoàn được chốt: ${money(accepted.refund_quote_vnd)}. Hãy theo dõi phản hồi của PT trong 24 giờ.`);
            await load();
          } catch (cause) { onMutationError(cause); }
          finally { setBusy(false); }
        } },
      ]);
  };

  const decide = (kind: 'accept' | 'withdraw') => {
    const stop = item?.stop_request;
    if (!stop || busy) return;
    Alert.alert(kind === 'accept' ? 'Đồng ý dừng gói?' : 'Rút yêu cầu dừng gói?',
      kind === 'accept'
        ? 'Hệ thống sẽ xử lý các buổi đủ điều kiện và lập yêu cầu hoàn tiền. PT không tự chuyển tiền.'
        : 'Gói sẽ tiếp tục hoạt động theo lịch hiện tại.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Xác nhận', onPress: async () => {
          if (busy) return;
          setBusy(true);
          try {
            const signature = `${kind}:${id}:${stop.id}`;
            if (kind === 'accept') await sessionPackageService.acceptStop(id, keyFor(signature));
            else await sessionPackageService.withdrawStop(id, stop.id, keyFor(signature));
            pendingKey.current = null;
            await load();
          } catch (cause) { onMutationError(cause); }
          finally { setBusy(false); }
        } },
      ]);
  };

  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại" style={styles.back}><ChevronLeft size={24} color={colors.textPrimary} /></Pressable>
      <Text style={typography.title1}>Chi tiết gói PT</Text>
    </View>
    {loading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text>Đang tải gói tập...</Text></View>
      : !item ? <View style={styles.center}><Text style={styles.error}>{error || 'Không tìm thấy gói tập.'}</Text><Pressable onPress={() => { setLoading(true); void load(); }} style={styles.action}><Text style={styles.actionText}>Thử lại</Text></Pressable></View>
      : <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={typography.title1}>Gói {item.session_count} buổi</Text>
            <Text style={styles.status}>{packageStatus(item.status)}</Text>
            <Text style={styles.line}>Giá gói: {money(item.total_price_vnd)}</Text>
            <Text style={styles.line}>Đã hoàn: {money(item.refunded_so_far_vnd)}</Text>
            <Text style={styles.note}>Trạng thái thanh toán: {item.payment_status ?? 'Chưa có thanh toán'}</Text>
            {item.status === 'PaymentPending' ? <>
              <Text style={styles.note}>Nếu bạn vừa chuyển tiền, hệ thống đang chờ xác nhận từ PayOS. Đừng thanh toán lần nữa khi trạng thái chưa rõ.</Text>
              <Pressable disabled={busy} onPress={() => void load()} style={styles.secondaryAction} accessibilityRole="button">
                <Text style={styles.secondaryText}>Cập nhật trạng thái thanh toán</Text>
              </Pressable>
            </> : null}
            {!asPt && (item.status === 'Held' || item.status === 'PaymentPending') &&
              Date.parse(item.hold_expires_at_utc) > Date.now() ?
              <Pressable disabled={busy} onPress={checkout} style={styles.action} accessibilityRole="button">
                <Text style={styles.actionText}>{busy ? 'Đang chuẩn bị...' : item.status === 'Held' ? 'Thanh toán qua PayOS' : 'Mở lại trang thanh toán'}</Text>
              </Pressable> : null}
          </View>
          <Text style={typography.title2}>Lịch trong gói</Text>
          {item.sessions.map((session) => <Pressable key={session.appointment_id} style={styles.card}
            onPress={() => router.push(asPt ? `/pt/session/${session.appointment_id}` as never : `/booking/${session.appointment_id}` as never)}
            accessibilityRole="button" accessibilityLabel={`Xem buổi ${session.sequence}`}>
            <Text style={typography.bodyBold}>Buổi {session.sequence} · {dateTime(session.slot_start_utc)}</Text>
            <Text style={styles.note}>{session.status} · {money(session.paid_allocation_vnd)}</Text>
          </Pressable>)}
          {item.stop_request ? <View style={styles.card}>
            <Text style={typography.title2}>Yêu cầu dừng gói</Text>
            <Text style={styles.line}>Lý do: {item.stop_request.reason}</Text>
            <Text style={styles.line}>Mức hoàn đã chốt: {money(item.stop_request.refund_quote_vnd)}</Text>
            <Text style={styles.note}>{item.stop_request.status === 'Pending' ? `PT phản hồi trước ${dateTime(item.stop_request.pt_response_deadline_utc)} (giờ Việt Nam)` : 'Yêu cầu đã được chấp nhận. Hoàn tiền sẽ do hệ thống xử lý thủ công.'}</Text>
            {!asPt && item.stop_request.status === 'Pending' && Date.now() < Date.parse(item.stop_request.pt_response_deadline_utc)
              ? <Pressable disabled={busy} onPress={() => decide('withdraw')} style={styles.secondaryAction} accessibilityRole="button"><Text style={styles.secondaryText}>Rút yêu cầu</Text></Pressable> : null}
            {asPt && item.stop_request.status === 'Pending'
              ? <Pressable disabled={busy} onPress={() => decide('accept')} style={styles.action} accessibilityRole="button"><Text style={styles.actionText}>Đồng ý dừng gói</Text></Pressable> : null}
          </View> : null}
          {!asPt && item.status === 'Active' && !item.stop_request ? <View style={styles.card}>
            <Text style={typography.title2}>Muốn dừng gói?</Text>
            <Text style={styles.note}>Các buổi đã tập hoặc bắt đầu trong vòng 48 giờ không được tự động hoàn. Xem số tiền dự kiến trước khi gửi yêu cầu.</Text>
            <Pressable disabled={busy} onPress={() => void loadPreview()} style={styles.secondaryAction} accessibilityRole="button"><Text style={styles.secondaryText}>{busy ? 'Đang tính...' : 'Xem mức hoàn dự kiến'}</Text></Pressable>
            {preview ? <>
              <Text style={typography.bodyBold}>Dự kiến hoàn: {money(preview.refund_quote_vnd)}</Text>
              {preview.sessions.map((session) => <Text key={session.appointment_id} style={styles.line}>
                Buổi {session.sequence}: {session.eligible_for_refund ? `Có thể hoàn ${money(session.paid_allocation_vnd)}` : 'Không tự động hoàn'}
              </Text>)}
              <Text style={styles.note}>Báo giá có thể đổi theo trạng thái và mốc 48 giờ. Nếu đổi khi gửi, ứng dụng sẽ yêu cầu bạn xem lại.</Text>
              <TextInput value={reason} onChangeText={(value) => { setReason(value); pendingKey.current = null; }}
                placeholder="Lý do dừng gói (10–1000 ký tự)" multiline maxLength={1000}
                style={styles.input} textAlignVertical="top" accessibilityLabel="Lý do dừng gói" />
              <Pressable disabled={busy} onPress={submit} style={styles.action} accessibilityRole="button"><Text style={styles.actionText}>Gửi yêu cầu dừng gói</Text></Pressable>
            </> : null}
          </View> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  status: { color: colors.primary, fontWeight: '700' },
  line: { ...typography.body, color: colors.textPrimary },
  note: { ...typography.caption, color: colors.textSecondary },
  error: { ...typography.body, color: colors.danger },
  action: { minHeight: 48, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  actionText: { ...typography.bodyBold, color: colors.white },
  secondaryAction: { minHeight: 48, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  secondaryText: { ...typography.bodyBold, color: colors.primary },
  input: { minHeight: 96, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
});
