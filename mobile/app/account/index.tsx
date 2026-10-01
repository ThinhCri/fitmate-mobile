import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  AccountHubPresentation,
  AccountHubViewModel,
} from '@/features/account';
import { getAccountRepository } from '@/repositories/accountRepository';
import { sessionManager } from '@/services/session/sessionManager';

export default function AccountHubScreen() {
  const [account, setAccount] = useState<AccountHubViewModel>({
    id: 'user-current',
    name: 'Đang tải...',
    email: '',
    role: 'member',
  });

  useEffect(() => {
    let mounted = true;
    getAccountRepository()
      .getAccountHub()
      .then((data) => {
        if (mounted) setAccount(data);
      })
      .catch((err) => {
        console.warn('Could not load account hub:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AccountHubPresentation
        account={account}
        onEditProfilePress={() => router.push('/account/edit-profile' as any)}
        onAppointmentsPress={() => router.push('/booking/my-appointments' as any)}
        onFriendsPress={() => router.push('/community/friends' as any)}
        onChatPress={() => router.push('/chat' as any)}
        onNotificationsPress={() => router.push('/notifications' as any)}
        onPtSpacePress={() => router.push('/pt' as any)}
        onHealthProfilePress={() => router.push('/account/health-profile' as any)}
        onSettingsPress={() => router.push('/account/settings' as any)}
        onSupportPress={() => router.push('/support' as any)}
        onLogoutPress={async () => {
          sessionManager.clearSession();
          router.replace('/(auth)/login' as any);
        }}
      />
    </SafeAreaView>
  );
}
