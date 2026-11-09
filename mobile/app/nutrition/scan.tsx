import { isFoodScanDemoEnabled, foodScanComingSoonMessage } from '@/services/foodScanAvailability';
import { checkAiAccess } from '@/services/aiAccess';
import { systemService } from '@/services/api/systemService';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
    if (!isFoodScanDemoEnabled()) return;
    if (started.current) {
      return () => {
        mounted.current = false;
      };
    }
    started.current = true;

    let lastImage: {uri:string;mimeType?:string|null} | null = null;
    const selectAndScan = async (source: 'camera' | 'library' | 'retry') => {
      const image = source === 'retry' ? lastImage : source === 'camera'
        ? await ImagePickerService.pickFromCamera({ quality: 0.8 })
        : await ImagePickerService.pickFromLibrary({ quality: 0.8 });
      if (!image) {
        if (router.canGoBack()) router.back();
        return;
      }

      lastImage = image;
      const reviewImageUri = await createStableReviewImage(image.uri, image.mimeType);
      setCurrentScanImageUri(reviewImageUri);

      if (mounted.current) {
        setImageUri(reviewImageUri);
        setIsAnalyzing(true);
      }

      let scanResult: NutritionScanResultViewModel;
      try {
        const access=await checkAiAccess('scan'); if (!access.allowed) throw new Error(access.message);
        scanResult = await getNutritionRepository().scanMealImage(reviewImageUri, image.mimeType);
      } catch (error) {
        if (!mounted.current) return;
        setIsAnalyzing(false);
        Alert.alert(
          'Không thể nhận diện món ăn',
          error instanceof Error ? error.message : 'Vui lòng thử lại hoặc nhập thủ công.',
          [
            { text: 'Thử lại ảnh này', onPress: () => void selectAndScan('retry') },
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

    const begin = async () => {
      try {
        systemService.clearCache(); const access=await checkAiAccess('scan');
        if (!mounted.current) return;
        if (!access.allowed) { Alert.alert('Nhận diện món ăn chưa sẵn sàng', access.message, [{text:'Nhập thủ công',onPress:()=>router.replace('/nutrition/manual-entry' as never)},{text:'Quay lại',style:'cancel',onPress:()=>router.back()}]); return; }
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

      } catch { if(mounted.current) Alert.alert('Không thể kiểm tra dịch vụ AI','Bạn có thể thử lại hoặc ghi bữa ăn thủ công.',[{text:'Thử lại',onPress:()=>void begin()},{text:'Nhập thủ công',onPress:()=>router.replace('/nutrition/manual-entry' as never)},{text:'Quay lại',onPress:()=>router.back()}]); }
    };
    void begin();
    return () => { mounted.current = false; };
  }, []);

  if (!isFoodScanDemoEnabled()) return (
    <View style={styles.container}>
      <Text style={styles.title}>Quét món ăn AI — Sắp ra mắt</Text>
      <Text style={styles.description}>{foodScanComingSoonMessage}</Text>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/nutrition/manual-entry' as never)} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 20 }}>
        <Text style={[styles.description, { color: colors.primary }]}>Ghi bữa ăn thủ công</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/' as never)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={styles.description}>Quay lại</Text></Pressable>
    </View>
  );

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
