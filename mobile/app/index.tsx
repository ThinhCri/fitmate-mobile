/**
 * Index — Entry point redirection based on auth & onboarding state.
 *
 * Rules:
 * 1. Sample preview only opens if EXPO_PUBLIC_ENABLE_SAMPLE_PREVIEW === 'true' (not unconditional __DEV__).
 * 2. If unauthenticated:
 *    - First time (hasSeenWelcome === false): /(auth)/welcome
 *    - Returning user (hasSeenWelcome === true): /(auth)/login
 * 3. If authenticated:
 *    - Member/PT: /(tabs)/dashboard
 *    - Admin: Blocked from mobile app with logout notice.
 */
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, Alert } from 'react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { getHasSeenWelcome } from '@/services/storage';

export default function Index() {
  const { user, loading, logout } = useAuth();
  const theme = useTheme();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcomeState] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const seen = await getHasSeenWelcome();
        if (mounted) {
          setHasSeenWelcomeState(seen);
        }
      } catch {
        if (mounted) {
          setHasSeenWelcomeState(false);
        }
      } finally {
        if (mounted) {
          setCheckingOnboarding(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Admin guard: if user is Admin, disallow mobile access and clear session
  useEffect(() => {
    if (user && (user as { role?: string }).role === 'admin') {
      Alert.alert(
        'Không được hỗ trợ',
        'Tài khoản Quản trị viên (Admin) chỉ dùng trên Web Admin. Ứng dụng di động chỉ dành cho Hội viên và Huấn luyện viên.'
      );
      logout();
    }
  }, [user, logout]);

  if (loading || checkingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: resolveColor(theme, 'surface'),
        }}
      >
        <ActivityIndicator size="large" color={resolveColor(theme, 'primary')} />
      </View>
    );
  }

  // Explicit preview flag (not unconditional __DEV__)
  if (process.env.EXPO_PUBLIC_ENABLE_SAMPLE_PREVIEW === 'true') {
    return <Redirect href="/sample-preview" />;
  }

  // Unauthenticated routing
  if (!user) {
    if (!hasSeenWelcome) {
      return <Redirect href="/(auth)/welcome" />;
    }
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
