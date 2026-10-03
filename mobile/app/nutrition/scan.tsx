import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { ImagePickerService } from '@/services/imagePicker';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CameraScanPresentation } from '@/features/nutrition/CameraScanPresentation';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function CameraScanRoute() {
  const [busy, setBusy] = useState(false);
  const cameraPermissionRequest = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    cameraPermissionRequest.current = ImagePickerService.requestCameraPermission();
  }, []);

  const pick = async (camera: boolean) => {
    if (busy) return;

    if (camera) {
      const granted = await (
        cameraPermissionRequest.current ?? ImagePickerService.requestCameraPermission()
      );
      if (!granted) {
        ImagePickerService.showCameraPermissionSettingsAlert();
        return;
      }
    }

    const image = camera
      ? await ImagePickerService.pickFromCamera({ quality: 0.8 })
      : await ImagePickerService.pickFromLibrary({ quality: 0.8 });
    if (!image) return;

    setBusy(true);
    try {
      const candidates = await getNutritionRepository().scanMealImage(image.uri);
      router.push({
        pathname: '/nutrition/candidates-review' as never,
        params: { candidates: JSON.stringify(candidates) },
      });
    } catch (e) {
      Alert.alert(
        'Không thể nhận diện món ăn',
        e instanceof Error ? e.message : 'Vui lòng thử lại hoặc nhập thủ công.'
      );
    } finally {
      setBusy(false);
    }
  };
  return <ScreenContainer edges={['top', 'bottom']}><CameraScanPresentation onBack={() => router.back()} onCapture={() => void pick(true)} onPickGallery={() => void pick(false)} onManualEntryPress={() => router.push('/nutrition/manual-entry' as never)} isAiAvailable={!busy} /></ScreenContainer>;
}
