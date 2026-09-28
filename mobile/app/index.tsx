/**
 * Index — redirect theo auth state.
 * - __DEV__ -> /sample-preview (xem 3 man hinh mau Stitch)
 * - Chua login -> /(auth)/login
 * - Da login -> /(tabs)/dashboard
 */
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export default function Index() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
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

  // Trong DEV mode, tu dong mo man hinh Sandbox Preview de kiem tra 3 man Stitch
  if (__DEV__) {
    return <Redirect href="/sample-preview" />;
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)/dashboard" />;
}
