import React from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CameraScanPresentation } from '@/features/nutrition/CameraScanPresentation';

export default function CameraScanRoute() {
  const handleCapture = () => {
    // Navigate to candidates review
    router.push('/nutrition/candidates-review' as any);
  };

  const handlePickGallery = () => {
    router.push('/nutrition/candidates-review' as any);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <CameraScanPresentation
        onBack={() => router.back()}
        onCapture={handleCapture}
        onPickGallery={handlePickGallery}
        onManualEntryPress={() => router.push('/nutrition/manual-entry' as any)}
      />
    </ScreenContainer>
  );
}
