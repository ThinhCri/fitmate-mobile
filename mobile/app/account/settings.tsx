import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Linking, Share, View } from 'react-native';
import { SettingsPresentation } from '@/features/account';
import { SettingsViewModel } from '@/features/account/accountTypes';
import { getAccountRepository } from '@/repositories/accountRepository';
import { requestNotificationPermission } from '@/services/initialPermissions';
import { ImagePickerService } from '@/services/imagePicker';
import { useAuth } from '@/services/AuthContext';
import { getAnalyticsConsent, isAnalyticsAvailable, updateAnalyticsConsent } from '@/services/analytics';

export default function SettingsScreen() {
  const { user } = useAuth();
  const repository = getAccountRepository();
  const [settings, setSettings] = useState<SettingsViewModel | null>(null);
  const [deletionPending, setDeletionPending] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  useEffect(() => { Promise.all([repository.getSettings(), repository.getDeletionStatus()]).then(([s, d]) => { setSettings(s); setDeletionPending(d.isPendingDeletion); }).catch((e) => Alert.alert('Không thể tải cài đặt', e instanceof Error ? e.message : 'Vui lòng thử lại.')); }, []);
  useEffect(() => { if (user?.id) void getAnalyticsConsent(user.id).then(setAnalyticsConsent).catch(() => {}); }, [user?.id]);
  const save = async (values: Partial<SettingsViewModel>) => { try { setSettings(await repository.updateSettings(values)); } catch (e) { Alert.alert('Không thể lưu cài đặt', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } };
  const openPolicy = async (url: string | undefined, label: string) => { if (!url) { Alert.alert(label, 'Máy chủ chưa công bố đường dẫn tài liệu này.'); return; } await Linking.openURL(url); };
  if (!settings) return <SafeAreaView style={{ flex: 1 }}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View></SafeAreaView>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SettingsPresentation
        settings={settings}
        onBack={() => router.back()}
        onChangePasswordPress={() =>
          router.push('/account/change-password' as any)
        }
        onNotificationSettingsPress={() => {
          void requestNotificationPermission(true);
        }}
        onCameraSettingsPress={() => {
          void ImagePickerService.requestCameraPermission(true);
        }}
        onPrivacyPress={() => void openPolicy(settings.privacyUrl, 'Dữ liệu & Quyền riêng tư')}
        onTermsPress={() => void openPolicy(settings.termsUrl, 'Điều khoản dịch vụ')}
        onNotificationsChange={(value) => void save({ notificationsEnabled: value, pushNotificationsEnabled: value })}
        onEmailAlertsChange={(value) => void save({ emailAlertsEnabled: value })}
        analyticsConsent={analyticsConsent}
        analyticsAvailable={isAnalyticsAvailable()}
        onAnalyticsConsentChange={(value) => {
          if (!user?.id) return;
          void updateAnalyticsConsent(user.id, value).then(() => setAnalyticsConsent(value))
            .catch(() => Alert.alert('Không thể lưu lựa chọn Analytics', 'Vui lòng thử lại.'));
        }}
        onExportPress={() => void repository.exportUserData().then(async (result) => { if (result.downloadUrl) await Linking.openURL(result.downloadUrl); else await Share.share({ title: 'Dữ liệu Fitmate của tôi', message: JSON.stringify(result.data, null, 2) }); }).catch((e) => Alert.alert('Không thể xuất dữ liệu', e.message))}
        isDeletionPending={deletionPending}
        onDeleteAccountPress={() => Alert.alert('Yêu cầu xóa tài khoản', 'Tài khoản sẽ vào thời gian chờ xóa. Bạn có thể hủy yêu cầu trong thời gian này.', [{ text: 'Hủy', style: 'cancel' }, { text: 'Tiếp tục', style: 'destructive', onPress: () => void repository.requestAccountDeletion().then(() => setDeletionPending(true)).catch((e) => Alert.alert('Không thể gửi yêu cầu', e.message)) }])}
        onCancelDeletionPress={() => void repository.cancelAccountDeletion().then(() => setDeletionPending(false)).catch((e) => Alert.alert('Không thể hủy yêu cầu', e.message))}
      />
    </SafeAreaView>
  );
}
