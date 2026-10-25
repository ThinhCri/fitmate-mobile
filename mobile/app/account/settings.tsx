import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SettingsPresentation } from '@/features/account';
import { SettingsViewModel } from '@/features/account/accountTypes';
import { getAccountRepository } from '@/repositories/accountRepository';
import { ImagePickerService } from '@/services/imagePicker';
import { useAuth } from '@/services/AuthContext';
import { getAnalyticsConsent, isAnalyticsAvailable, updateAnalyticsConsent } from '@/services/analytics';
import { AnalyticsPreference } from '@/features/account/AnalyticsPreference';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function SettingsScreen() {
  const { user } = useAuth();
  const repository = getAccountRepository();
  const [settings, setSettings] = useState<SettingsViewModel | null>(null);
  const [deletionPending, setDeletionPending] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [analyticsBusy, setAnalyticsBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [deletionKnown, setDeletionKnown] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace('/account' as any); };
  useEffect(() => {
    let active = true;
    setLoadError(false);
    // A deletion-status failure must not block all settings or local consent.
    void repository.getSettings().then((s) => { if (active) setSettings(s); })
      .catch(() => { if (active) setLoadError(true); });
    void repository.getDeletionStatus().then((d) => {
      if (active) { setDeletionPending(d.isPendingDeletion); setDeletionKnown(true); }
    }).catch(() => { if (active) setDeletionKnown(false); });
    return () => { active = false; };
  }, [repository, attempt]);
  useEffect(() => { if (user?.id) void getAnalyticsConsent(user.id).then(setAnalyticsConsent).catch(() => {}); }, [user?.id]);
  const openPolicy = async (url: string | undefined, label: string) => { if (!url) { Alert.alert(label, 'Máy chủ chưa công bố đường dẫn tài liệu này.'); return; } await Linking.openURL(url); };
  const changeAnalyticsConsent = useCallback(async (enabled: boolean) => {
    if (!user?.id || analyticsBusy) return;
    setAnalyticsBusy(true);
    try { await updateAnalyticsConsent(user.id, enabled); setAnalyticsConsent(enabled); }
    catch { Alert.alert('Không thể lưu lựa chọn thống kê', 'Vui lòng thử lại.'); }
    finally { setAnalyticsBusy(false); }
  }, [user, analyticsBusy]);
  const checkDeletionStatus = () => {
    if (deletionKnown) return true;
    Alert.alert('Chưa tải được trạng thái tài khoản', 'Vui lòng thử lại trước khi yêu cầu hoặc hủy xóa tài khoản.',
      [{ text: 'Đóng' }, { text: 'Thử lại', onPress: () => setAttempt((value) => value + 1) }]);
    return false;
  };
  if (!settings) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <TouchableOpacity accessibilityRole="button" onPress={goBack} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={typography.body}>← Quay lại</Text></TouchableOpacity>
      <Text style={typography.title1}>Cài đặt hệ thống</Text>
      <AnalyticsPreference available={isAnalyticsAvailable()} enabled={analyticsConsent} busy={analyticsBusy}
        onChange={(enabled) => { void changeAnalyticsConsent(enabled); }} />
      {loadError ? <><Text style={typography.body}>Không tải được các cài đặt khác. Lựa chọn thống kê ở trên vẫn hoạt động.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={typography.body}>Thử lại</Text></TouchableOpacity></>
        : <ActivityIndicator color={colors.primary} accessibilityLabel="Đang tải các cài đặt khác" />}
    </ScrollView>
  </SafeAreaView>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SettingsPresentation
        settings={settings}
        onBack={goBack}
        onChangePasswordPress={() =>
          router.push('/account/change-password' as any)
        }
        onNotificationSettingsPress={() => {
          void Linking.openSettings().catch(() => Alert.alert('Không thể mở cài đặt', 'Vui lòng vào Cài đặt điện thoại → Ứng dụng → Fitmate → Thông báo.'));
        }}
        onCameraSettingsPress={() => {
          void ImagePickerService.requestCameraPermission(true);
        }}
        onPrivacyPress={() => void openPolicy(settings.privacyUrl, 'Dữ liệu & Quyền riêng tư')}
        onTermsPress={() => void openPolicy(settings.termsUrl, 'Điều khoản dịch vụ')}
        analyticsConsent={analyticsConsent}
        analyticsAvailable={isAnalyticsAvailable()}
        analyticsBusy={analyticsBusy}
        onAnalyticsConsentChange={(value) => { void changeAnalyticsConsent(value); }}
        isDeletionPending={deletionPending}
        onDeleteAccountPress={() => { if (checkDeletionStatus()) router.push('/account/deletion-otp' as any); }}
        onCancelDeletionPress={() => { if (checkDeletionStatus()) void repository.cancelAccountDeletion().then(() => setDeletionPending(false)).catch((e) => Alert.alert('Không thể hủy yêu cầu', e.message)); }}
      />
    </SafeAreaView>
  );
}
