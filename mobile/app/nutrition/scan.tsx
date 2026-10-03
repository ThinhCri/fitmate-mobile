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

    const selectAndScan = async (source: 'camera' | 'library') => {
      const image = source === 'camera'
        ? await ImagePickerService.pickFromCamera({ quality: 0.8 })
        : await ImagePickerService.pickFromLibrary({ quality: 0.8 });
      if (!image) {
        if (router.canGoBack()) router.back();
        return;
      }

      try {
        const candidates = await getNutritionRepository().scanMealImage(image.uri, image.mimeType);
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

    Alert.alert(
      'Chọn ảnh món ăn',
      'Bạn có thể chụp ảnh mới hoặc chọn ảnh có sẵn từ thư viện và Google Photos.',
      [
        { text: 'Quay lại', style: 'cancel', onPress: () => router.back() },
        { text: 'Thư viện ảnh', onPress: () => void selectAndScan('library') },
        { text: 'Chụp ảnh', onPress: () => void selectAndScan('camera') },
      ],
      { cancelable: true, onDismiss: () => router.back() }
    );
  }, []);

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
