import React, { useEffect, useRef } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { ImagePickerService } from '@/services/imagePicker';
import { getNutritionRepository } from '@/repositories/nutritionRepository';
import { colors } from '@/theme/designTokens';

export default function CameraScanRoute() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const captureAndScan = async () => {
      const image = await ImagePickerService.pickFromCamera({ quality: 0.8 });
      if (!image) {
        if (router.canGoBack()) router.back();
        return;
      }

      try {
        const candidates = await getNutritionRepository().scanMealImage(image.uri);
        router.replace({
          pathname: '/nutrition/candidates-review' as never,
          params: { candidates: JSON.stringify(candidates) },
        });
      } catch (error) {
        Alert.alert(
          'Không thể nhận diện món ăn',
          error instanceof Error ? error.message : 'Vui lòng thử lại hoặc nhập thủ công.',
          [
            { text: 'Nhập thủ công', onPress: () => router.replace('/nutrition/manual-entry' as never) },
            { text: 'Quay lại', style: 'cancel', onPress: () => router.back() },
          ]
        );
      }
    };

    void captureAndScan();
  }, []);

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
