import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ImagePickerService } from '@/services/imagePicker';
import { getNutritionRepository } from '@/repositories/nutritionRepository';
import { colors } from '@/theme/designTokens';
import * as FileSystem from 'expo-file-system/legacy';
import { setCurrentScanImageUri } from '@/features/nutrition/nutritionScanSession';
import type { NutritionScanResultViewModel } from '@/features/nutrition/nutritionTypes';

async function createStableReviewImage(uri: string, mimeType?: string | null) {
  if (!FileSystem.cacheDirectory) return uri;
  const extension = mimeType?.toLowerCase().includes('png')
    ? 'png'
    : mimeType?.toLowerCase().includes('webp')
      ? 'webp'
      : 'jpg';
  const destination = `${FileSystem.cacheDirectory}fitmate-scan-review-${Date.now()}.${extension}`;
  try {
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  } catch {
    return uri;
  }
}

export default function CameraScanRoute() {
  const started = useRef(false);
  const mounted = useRef(true);
  const [imageUri, setImageUri] = useState<string>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    mounted.current = true;
    if (started.current) {
      return () => {
        mounted.current = false;
      };
    }
    started.current = true;

    const selectAndScan = async (source: 'camera' | 'library') => {
      const image = source === 'camera'
        ? await ImagePickerService.pickFromCamera({ quality: 0.8 })
        : await ImagePickerService.pickFromLibrary({ quality: 0.8 });
      if (!image) {
        if (router.canGoBack()) router.back();
        return;
      }

      const reviewImageUri = await createStableReviewImage(image.uri, image.mimeType);
      setCurrentScanImageUri(reviewImageUri);

      if (mounted.current) {
        setImageUri(reviewImageUri);
        setIsAnalyzing(true);
      }

      let scanResult: NutritionScanResultViewModel;
      try {
        scanResult = await getNutritionRepository().scanMealImage(reviewImageUri, image.mimeType);
      } catch (error) {
        if (!mounted.current) return;
        setIsAnalyzing(false);
        Alert.alert(
          'Không thể nhận diện món ăn',
          error instanceof Error ? error.message : 'Vui lòng thử lại hoặc nhập thủ công.',
          [
            { text: 'Nhập thủ công', onPress: () => router.replace('/nutrition/manual-entry' as never) },
            { text: 'Quay lại', style: 'cancel', onPress: () => router.back() },
          ]
        );
        return;
      }

      if (!mounted.current) return;
      router.replace({
        pathname: '/nutrition/candidates-review' as never,
        params: {
          candidates: JSON.stringify(scanResult.candidates),
          ingredients: JSON.stringify(scanResult.ingredients),
          imageUri: reviewImageUri,
        },
      });
    };

    Alert.alert(
      'Chọn ảnh món ăn',
      'Bạn có thể chụp ảnh mới hoặc chọn ảnh có sẵn từ thư viện và Google Photos.',
      [
        { text: 'Quay lại', style: 'cancel', onPress: () => router.back() },
        { text: 'Thư viện ảnh', onPress: () => void selectAndScan('library') },
        { text: 'Chụp ảnh', onPress: () => void selectAndScan('camera') },
      ],
      { cancelable: false }
    );

    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Ảnh món ăn đang được phân tích"
        />
      ) : null}
      {isAnalyzing ? (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.title}>Đang nhận diện món ăn</Text>
          <Text style={styles.description}>
            AI đang ước tính khẩu phần và dinh dưỡng. Quá trình này có thể mất một vài phút trong môi trường thử nghiệm.
          </Text>
        </>
      ) : (
        <Text style={styles.description}>Đang mở trình chọn ảnh...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.background,
  },
  preview: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 4 / 3,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    maxWidth: 360,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
