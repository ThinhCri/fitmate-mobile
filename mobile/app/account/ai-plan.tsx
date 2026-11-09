import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { deepLinkToSubscriptions, ErrorCode, getAvailablePurchases, useIAP, type Purchase } from 'expo-iap';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { aiSubscriptionService, aiUsageService, type AiSubscriptionStatus, type AiUsageStatus } from '@/services/api/aiUsageService';
import { sessionManager } from '@/services/session/sessionManager';
import { useAuth } from '@/services/AuthContext';
import { ACCOUNT_PURCHASE_CONFLICT, checkoutBillingAccountId, isPurchaseAccountConflict, recoverPlayPurchases } from '@/services/playPurchaseRecovery';

export default function AiPlanScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AiUsageStatus | null>(null);
  const [subscription, setSubscription] = useState<AiSubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setSubscription(null);
    const generation = sessionManager.getGeneration();
    try {
      const billing = await aiSubscriptionService.getStatus();
      const usage = await aiUsageService.getStatus();
      if (generation !== sessionManager.getGeneration()) return;
      setStatus(usage);
      setSubscription(billing);
    } catch (cause) {
      if (generation !== sessionManager.getGeneration()) return;
      setError(cause instanceof Error ? cause.message : 'Không thể tải hạn mức AI.');
    } finally {
      if (generation === sessionManager.getGeneration()) setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại" style={styles.back}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Gói AI của tôi</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>

        {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Đang tải hạn mức AI" /> : null}
        {error ? (
          <View style={styles.card}>
            <Text style={styles.body}>{error}</Text>
            <Pressable onPress={() => void load()} accessibilityRole="button" style={styles.retry}><Text style={styles.retryText}>Thử lại</Text></Pressable>
          </View>
        ) : null}
        {status && !loading && !error ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gói hiện tại: {status.plan === 'plus' ? 'AI Plus' : 'Miễn phí'}</Text>
            {status.enforcement_enabled ? (
              <>
                <UsageRow icon={<MessageCircle size={18} color={colors.primary} />} label="Chat và gợi ý tập luyện" remaining={status.chat.remaining} limit={status.chat.limit} />
                <Text style={styles.caption}>Lượt dùng làm mới lúc 00:00 mỗi ngày.</Text>
              </>
            ) : (
              <Text style={styles.body}>Hiện chưa áp dụng giới hạn lượt dùng. Khi được bật, hạn mức và số lượt còn lại sẽ hiển thị tại đây.</Text>
            )}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Plus</Text>
          <Text style={styles.body}>100 lượt chat và gợi ý tập luyện mỗi ngày.</Text>
          <Text style={styles.caption}>Trả trước 1 tháng · Không tự gia hạn</Text>
          {subscription?.expires_at_utc && subscription.plan === 'plus' ? <Text style={styles.caption}>Có hiệu lực đến {new Date(subscription.expires_at_utc).toLocaleString('vi-VN')} theo Google Play.</Text> : null}
          {subscription && (subscription.billing_available || subscription.restore_available) && Platform.OS === 'android' && Constants.appOwnership !== 'expo' ? (
            <BillingActions key={user?.id} subscription={subscription} onVerified={load} />
          ) : (
            <View style={styles.notice}><Text style={styles.noticeText}>{subscription?.billing_available
              ? 'Mua gói cần bản Android cài từ Google Play hoặc bản thử nghiệm có tích hợp Play Billing; Expo Go không hỗ trợ.'
              : 'Chưa mở bán. Giá sẽ lấy trực tiếp từ Google Play khi gói được cấu hình.'}</Text></View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BillingActions({ subscription, onVerified }: { subscription: AiSubscriptionStatus; onVerified: () => Promise<void> }) {
  const { user } = useAuth();
  const generation = React.useRef(sessionManager.getGeneration());
  const sessionIsCurrent = () => generation.current === sessionManager.getGeneration();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { connected, subscriptions, fetchProducts, requestPurchase } = useIAP({
    onPurchaseSuccess: (purchase) => { void verifyPurchase(purchase); },
    onPurchaseError: (error) => {
      setBusy(false);
      if (error.code !== ErrorCode.UserCancelled) setMessage('Google Play chưa hoàn tất giao dịch. Vui lòng thử lại.');
    },
  });

  const verifyPurchase = async (purchase: Purchase) => {
    if (!sessionIsCurrent()) return;
    if (purchase.productId !== subscription.product_id || !purchase.purchaseToken) return;
    if (purchase.purchaseState !== 'purchased') {
      setMessage('Giao dịch đang chờ Google Play xác nhận; Fitmate chưa cấp quyền AI Plus.');
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      const verified = await aiSubscriptionService.verify(purchase.purchaseToken);
      if (!sessionIsCurrent()) return;
      if (verified.plan !== 'plus') {
        setMessage('Google Play chưa xác nhận gói đang có hiệu lực. Vui lòng kiểm tra lại sau.');
        return;
      }
      // Backend acknowledges this subscription with Google before granting Plus.
      // Do not acknowledge it a second time from this Android client.
      await onVerified();
      setMessage('AI Plus đã được xác nhận trên tài khoản này.');
    } catch (cause) {
      if (sessionIsCurrent()) setMessage(isPurchaseAccountConflict(cause) ? ACCOUNT_PURCHASE_CONFLICT : cause instanceof Error ? cause.message : 'Chưa thể xác minh giao dịch. Bạn có thể thử Khôi phục gói sau.');
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    if (!connected) return;
    void fetchProducts({ skus: [subscription.product_id], type: 'subs' }).catch(() => {
      setMessage('Chưa tải được thông tin gói từ Google Play.');
    });
  }, [connected, fetchProducts, subscription.product_id]);

  const product = subscriptions.find((item) => item.id === subscription.product_id && item.platform === 'android');
  const offer = product?.platform === 'android'
    ? product.subscriptionOffers.find((item) => item.basePlanIdAndroid === subscription.base_plan_id && !item.id)
      ?? product.subscriptionOffers.find((item) => item.basePlanIdAndroid === subscription.base_plan_id)
    : undefined;

  const buy = async () => {
    if (!subscription.billing_available || !connected || !offer?.offerTokenAndroid) return;
    setBusy(true);
    setMessage(null);
    try {
      // Refresh the server's intended recipient immediately before checkout. This
      // binding identifies the Fitmate user; it cannot select a Google payer Gmail.
      const fresh = await aiSubscriptionService.getStatus();
      if (!sessionIsCurrent()) return;
      if (fresh.plan === 'plus') { await onVerified(); setBusy(false); return; }
      if (!fresh.billing_available) throw new Error('Hiện chưa thể mua gói. Vui lòng thử lại sau.');
      const accountId = checkoutBillingAccountId(fresh.billing_account_id);
      const recovery = await recoverPlayPurchases(await getAvailablePurchases(), subscription.product_id, aiSubscriptionService.verify, sessionIsCurrent);
      if (!sessionIsCurrent()) return;
      if (recovery.restored) {
        await onVerified();
        setMessage('Gói đã mua còn hiệu lực trên tài khoản này. Không cần mua lại.');
        setBusy(false);
        return;
      }
      if (recovery.conflict || recovery.pending) {
        setMessage(recovery.conflict ? ACCOUNT_PURCHASE_CONFLICT : 'Google Play còn giao dịch đang chờ xử lý. Hãy kiểm tra trước khi mua thêm.');
        setBusy(false);
        return;
      }
      await requestPurchase({
        request: { google: { skus: [subscription.product_id], obfuscatedAccountId: accountId, subscriptionOffers: [{ sku: subscription.product_id, offerToken: offer.offerTokenAndroid }] } },
        type: 'subs',
      });
    } catch (cause) {
      setBusy(false);
      if (sessionIsCurrent()) setMessage(cause instanceof Error ? cause.message : 'Chưa kiểm tra được giao dịch đang có trên Google Play. Chưa mở thanh toán mới; vui lòng thử lại.');
    }
  };

  const restore = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const purchases = await getAvailablePurchases();
      const result = await recoverPlayPurchases(purchases, subscription.product_id, aiSubscriptionService.verify, sessionIsCurrent);
      if (!sessionIsCurrent()) return;
      if (result.restored) { await onVerified(); setMessage('AI Plus đã được xác nhận trên tài khoản này.'); }
      else setMessage(result.conflict ? ACCOUNT_PURCHASE_CONFLICT : result.pending ? 'Giao dịch đang chờ Google Play xác nhận.' : 'Chưa tìm thấy gói còn hiệu lực trên tài khoản Google Play hiện tại.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Không khôi phục được gói.');
    } finally {
      setBusy(false);
    }
  };

  const manage = async () => {
    try {
      await deepLinkToSubscriptions({ skuAndroid: subscription.product_id, packageNameAndroid: 'vn.fitmate.app' });
    } catch {
      setMessage('Không mở được Google Play. Hãy vào Play Store → Thanh toán và gói thuê bao.');
    }
  };

  const accountHelp = () => Alert.alert('Đổi tài khoản thanh toán Google Play',
    '1. Hủy thanh toán nếu hộp Google Play hiện sai Gmail.\n2. Mở CH Play và chọn Gmail muốn thanh toán.\n3. Nếu hộp thanh toán vẫn dùng Gmail cũ, sau khi dữ liệu đã đồng bộ, gỡ Fitmate rồi cài lại từ CH Play bằng Gmail muốn dùng.\n\nKhông cần xóa tài khoản Google khỏi điện thoại. Đổi Gmail thanh toán không chuyển gói đã mua sang tài khoản Fitmate khác.',
    [{ text: 'Đóng', style: 'cancel' }, { text: 'Mở CH Play', onPress: () => {
      void Linking.openURL('market://details?id=vn.fitmate.app').catch(() => setMessage('Không mở được CH Play. Bạn hãy mở ứng dụng CH Play trên điện thoại.'));
    } }]);

  return <View style={styles.billingActions}>
    {subscription.billing_available && subscription.plan !== 'plus' && user?.email ? <Text style={styles.caption}>Tài khoản Fitmate nhận gói: {user.email}</Text> : null}
    {subscription.billing_available ? (offer?.displayPrice
      ? <Text style={styles.price}>{offer.displayPrice} / tháng</Text>
      : <Text style={styles.caption}>Chưa tải được giá từ Google Play; hiện không thể mua.</Text>)
      : <Text style={styles.caption}>Hiện chưa thể mua gói.</Text>}
    {subscription.billing_available && subscription.plan !== 'plus' ? <Pressable accessibilityRole="button" disabled={busy || !connected || !offer?.offerTokenAndroid}
      onPress={() => void buy()} style={[styles.primaryButton, (busy || !connected || !offer?.offerTokenAndroid) && styles.disabled]}>
      <Text style={styles.primaryButtonText}>Mua qua Google Play</Text>
    </Pressable> : null}
    <Pressable accessibilityRole="button" disabled={busy || !connected} onPress={() => void restore()} style={styles.retry}>
      <Text style={styles.retryText}>Khôi phục giao dịch</Text>
    </Pressable>
    {subscription.plan === 'plus' ? <Pressable accessibilityRole="button" onPress={() => void manage()} style={styles.retry}>
      <Text style={styles.retryText}>Quản lý trên Google Play</Text>
    </Pressable> : null}
    {busy ? <ActivityIndicator color={colors.primary} accessibilityLabel="Đang xác minh giao dịch" /> : null}
    {message ? <Text style={styles.caption}>{message}</Text> : null}
    <Pressable accessibilityRole="button" onPress={accountHelp} style={styles.retry}><Text style={styles.retryText}>Tài khoản thanh toán không đúng?</Text></Pressable>
  </View>;
}

function UsageRow({ icon, label, remaining, limit }: { icon: React.ReactNode; label: string; remaining: number; limit: number }) {
  return <View style={styles.usageRow}>{icon}<Text style={styles.usageLabel}>{label}</Text><Text style={styles.usageValue}>{remaining}/{limit} lượt</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { height: 56, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.title2 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
  hero: { gap: spacing.sm, paddingVertical: spacing.md },
  heroTitle: { ...typography.title1 },
  body: { ...typography.body, color: colors.textSecondary },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  cardTitle: { ...typography.title2 },
  usageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48 },
  usageLabel: { ...typography.bodyMedium, flex: 1 },
  usageValue: { ...typography.bodyBold, color: colors.primary },
  caption: { ...typography.caption },
  notice: { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md },
  noticeText: { ...typography.bodyMedium, color: colors.primaryDark },
  retry: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  retryText: { ...typography.bodyBold, color: colors.primary },
  billingActions: { gap: spacing.sm },
  price: { ...typography.title2, color: colors.primary },
  primaryButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.primary },
  primaryButtonText: { ...typography.bodyBold, color: colors.surface },
  disabled: { opacity: 0.5 },
});
