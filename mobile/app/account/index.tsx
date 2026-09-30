import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  AccountHubPresentation,
  AccountHubViewModel,
} from '@/features/account';

export default function AccountHubScreen() {
  const account: AccountHubViewModel = {
    id: 'user-current',
    name: 'Nguyễn Minh Anh',
    email: 'minhanh.fit@gmail.com',
    role: 'member', // Can switch to 'pt' to test PT space link
    isVerified: true,
    upcomingBookingCount: 1,
    friendCount: 24,
    unreadChatCount: 1,
    unreadNotifCount: 2,
  };

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
        onLogoutPress={() => {
          // Handle clean logout and redirect to auth
          router.replace('/(auth)/login' as any);
        }}
      />
    </SafeAreaView>
  );
}
