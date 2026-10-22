import React from 'react';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/designTokens';

export default function PtLayout() {
  const { top } = useSafeAreaInsets();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background, paddingTop: top } }}>
      {/* These screens already apply their own top safe area. */}
      <Stack.Screen name="verify-phone" options={{ contentStyle: { backgroundColor: colors.background } }} />
      <Stack.Screen name="packages" options={{ contentStyle: { backgroundColor: colors.background } }} />
    </Stack>
  );
}
