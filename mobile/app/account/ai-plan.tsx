import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { deepLinkToSubscriptions, ErrorCode, getAvailablePurchases, useIAP, type Purchase } from 'expo-iap';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, ScanLine, Sparkles } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { aiSubscriptionService, aiUsageService, type AiSubscriptionStatus, type AiUsageStatus } from '@/services/api/aiUsageService';

export default function AiPlanScreen() {
  const [status, setStatus] = useState<AiUsageStatus | null>(null);
  const [subscription, setSubscription] = useState<AiSubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usage, billing] = await Promise.all([aiUsageService.getStatus(), aiSubscriptionService.getStatus()]);
      setStatus(usage);
      setSubscription(billing);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải hạn mức AI.');
    } finally {
      setLoading(false);
    }
  }, []);

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
        <View style={styles.hero}>
          <Sparkles size={24} color={colors.primary} />
          <Text style={styles.heroTitle}>Fitmate AI cho nhu cầu hằng ngày</Text>
          <Text style={styles.body}>Chat về tập luyện, dinh dưỡng và quét ảnh món ăn. Kết quả AI là gợi ý; bạn vẫn cần kiểm tra trước khi lưu bữa ăn.</Text>
        </View>

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
                <UsageRow icon={<MessageCircle size={18} color={colors.primary} />} label="Chat với AI" remaining={status.chat.remaining} limit={status.chat.limit} />
                <UsageRow icon={<ScanLine size={18} color={colors.primary} />} label="Quét món ăn" remaining={status.scan.remaining} limit={status.scan.limit} />
                <Text style={styles.caption}>Làm mới lúc 00:00 giờ Việt Nam, ngày {new Date(status.resets_at_utc).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}.</Text>
              </>
            ) : (
              <Text style={styles.body}>Hạn mức chưa áp dụng trong giai đoạn thử nghiệm. Khi bắt đầu áp dụng, số lượt còn lại sẽ hiển thị ở đây.</Text>
            )}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Plus trả trước 1 tháng</Text>
          <Text style={styles.body}>Thanh toán một lần cho một tháng sử dụng, không tự gia hạn. Tăng hạn mức chat và quét món mỗi ngày; hạn mức thực tế hiển thị ở phía trên sau khi Google xác nhận. Gói PT và lịch tập 1–1 không nằm trong quyền lợi này.</Text>
          {subscription?.expires_at_utc && subscription.plan === 'plus' ? <Text style={styles.caption}>Có hiệu lực đến {new Date(subscription.expires_at_utc).toLocaleString('vi-VN')} theo Google Play.</Text> : null}
          {subscription && (subscription.billing_available || subscription.restore_available) && Platform.OS === 'android' && Constants.appOwnership !== 'expo' ? (
            <BillingActions subscription={subscription} onVerified={load} />
          ) : (
            <View style={styles.notice}><Text style={styles.noticeText}>{subscription?.billing_available
              ? 'Mua gói cần bản Android cài từ Google Play hoặc bản thử nghiệm có tích hợp Play Billing; Expo Go không hỗ trợ.'
              : 'Chưa mở bán. Giá sẽ lấy trực tiếp từ Google Play khi gói được cấu hình.'}</Text></View>
          )}
          <Text style={styles.caption}>Hết hạn, gói tự dừng. Nếu Fitmate còn mở bán, bạn có thể chủ động mua kỳ mới; không bị trừ tiền tự động.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BillingActions({ subscription, onVerified }: { subscription: AiSubscriptionStatus; onVerified: () => Promise<void> }) {
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
    if (purchase.productId !== subscription.product_id || !purchase.purchaseToken) return;
    if (purchase.purchaseState !== 'purchased') {
      setMessage('Giao dịch đang chờ Google Play xác nhận; Fitmate chưa cấp quyền AI Plus.');
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      const verified = await aiSubscriptionService.verify(purchase.purchaseToken);
      if (verified.plan !== 'plus') {
        setMessage('Google Play chưa xác nhận gói đang có hiệu lực. Vui lòng kiểm tra lại sau.');
        return;
      }
      // Backend acknowledges this subscription with Google before granting Plus.
      // Do not acknowledge it a second time from this Android client.
      await onVerified();
      setMessage('AI Plus đã được xác nhận trên tài khoản này.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Chưa thể xác minh giao dịch. Bạn có thể thử Khôi phục gói sau.');
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
      await requestPurchase({
        request: { google: { skus: [subscription.product_id], subscriptionOffers: [{ sku: subscription.product_id, offerToken: offer.offerTokenAndroid }] } },
        type: 'subs',
      });
    } catch {
      setBusy(false);
      setMessage('Không mở được thanh toán Google Play. Vui lòng thử lại.');
    }
  };

  const restore = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const purchases = await getAvailablePurchases();
      const matching = purchases.filter((item) => item.productId === subscription.product_id && item.purchaseToken);
      if (!matching.length) {
        setMessage('Google Play không tìm thấy gói AI Plus trên tài khoản Play hiện tại.');
        return;
      }
      for (const purchase of matching) await verifyPurchase(purchase);
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

  return <View style={styles.billingActions}>
    {subscription.billing_available ? (offer?.displayPrice
      ? <Text style={styles.price}>{offer.displayPrice} / tháng</Text>
      : <Text style={styles.caption}>Chưa tải được giá từ Google Play; hiện không thể mua.</Text>)
      : <Text style={styles.caption}>Fitmate tạm ngừng bán kỳ mới. Gói đã mua vẫn có thể khôi phục và dùng đến ngày hết hạn.</Text>}
    {subscription.billing_available && subscription.plan !== 'plus' ? <Pressable accessibilityRole="button" disabled={busy || !connected || !offer?.offerTokenAndroid}
      onPress={() => void buy()} style={[styles.primaryButton, (busy || !connected || !offer?.offerTokenAndroid) && styles.disabled]}>
      <Text style={styles.primaryButtonText}>Mua qua Google Play</Text>
    </Pressable> : null}
    <Pressable accessibilityRole="button" disabled={busy || !connected} onPress={() => void restore()} style={styles.retry}>
      <Text style={styles.retryText}>Khôi phục gói đã mua</Text>
    </Pressable>
    <Pressable accessibilityRole="button" onPress={() => void manage()} style={styles.retry}>
      <Text style={styles.retryText}>Xem gói trên Google Play</Text>
    </Pressable>
    {busy ? <ActivityIndicator color={colors.primary} accessibilityLabel="Đang xác minh giao dịch" /> : null}
    {message ? <Text style={styles.caption}>{message}</Text> : null}
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
