import { colors } from '@/theme/designTokens';
import { Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import {
  AccountHubPresentation,
  AccountHubViewModel,
} from '@/features/account';
import { getAccountRepository } from '@/repositories/accountRepository';
import { useAuth } from '@/services/AuthContext';

export default function AccountHubScreen() {
  const { logout, user } = useAuth();
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const ptIsApproved = user?.ptVerificationStatus === 'approved';
  const [account, setAccount] = useState<AccountHubViewModel>({
    id: 'user-current',
    name: 'Đang tải...',
    email: '',
    role: 'member',
  });

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoadError('');
    getAccountRepository()
      .getAccountHub()
      .then((data) => {
        if (active) { setAccount(data); setLoadError(''); }
      })
      .catch(() => { if(active) setLoadError('Không tải được hồ sơ. Vui lòng thử lại.'); });
    return () => {
      active = false;
    };
  }, [retry, user?.id]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {loadError ? <View style={{padding:16}}><Text accessibilityRole="alert">{loadError}</Text><TouchableOpacity accessibilityRole="button" style={{minHeight:44,justifyContent:'center'}} onPress={()=>setRetry(value=>value+1)}><Text>Thử tải lại hồ sơ</Text></TouchableOpacity></View> : null}
      <AccountHubPresentation
        account={account}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/dashboard' as any);
        }}
        onEditProfilePress={() => router.push('/account/edit-profile' as any)}
        onAppointmentsPress={() => router.push('/booking/my-appointments' as any)}
        ptIsApproved={ptIsApproved}
        onPtSpacePress={() => router.push((ptIsApproved ? '/pt' : '/pt/certificates') as any)}
        onHealthProfilePress={() => router.push('/account/health-profile' as any)}
        onSettingsPress={() => router.push('/account/settings' as any)}
        onSupportPress={() => router.push('/support' as any)}
        onSavedPostsPress={() => router.push('/community/saved' as any)}
        onAiPlanPress={() => router.push('/account/ai-plan' as any)}
        onLogoutPress={async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        }}
      />
    </SafeAreaView>
  );
}
