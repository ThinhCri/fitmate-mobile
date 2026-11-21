/**
 * Root layout — ThemeProvider + AuthProvider + Stack.
 * Expo Router handles navigation; this layer wraps global providers.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';
import '@/theme/patchStyleSheet';
import { ThemeProvider, useTheme } from '@/theme';
import { AuthProvider } from '@/services/AuthContext';
import { PtVerificationGate } from '@/services/PtVerificationGate';
import { AnalyticsTracker } from '@/services/AnalyticsTracker';
import { PushLifecycle } from '@/services/PushLifecycle';
import { PlayPurchaseLifecycle } from '@/services/PlayPurchaseLifecycle';
import { ToastHost } from '@/components/ui';

function InnerApp() {
  const { isDark, themeKey } = useTheme();

  return (
    <GestureHandlerRootView key={themeKey} style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <PtVerificationGate />
          <AnalyticsTracker />
          <PushLifecycle />
          <PlayPurchaseLifecycle />
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'android' ? 'height' : undefined}
          >
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: isDark ? '#090D16' : '#F8FAFC' },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
            </Stack>
          </KeyboardAvoidingView>
          <ToastHost />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  );
}
