import React from 'react';
import { Stack } from 'expo-router';
import { PtRoleGuard } from '@/components/auth/PtRoleGuard';

export default function PtLayout() {
  return (
    <PtRoleGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="profile-services" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="certificates" />
      </Stack>
    </PtRoleGuard>
  );
}
