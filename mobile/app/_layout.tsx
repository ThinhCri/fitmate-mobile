/**
 * Root layout — ThemeProvider + AuthProvider + Stack.
 * Expo Router handles navigation; this layer wraps global providers.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { ThemeProvider } from '@/theme';
import { AuthProvider } from '@/services/AuthContext';
import { PtVerificationGate } from '@/services/PtVerificationGate';
import { ToastHost } from '@/components/ui';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <PtVerificationGate />
            <StatusBar style="dark" />
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'android' ? 'height' : undefined}
            >
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFAF7' } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
              </Stack>
            </KeyboardAvoidingView>
            <ToastHost />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
