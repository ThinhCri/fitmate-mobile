import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { CameraScanPresentation } from '@/features/nutrition/CameraScanPresentation';
import { getNutritionRepository } from '@/repositories/nutritionRepository';

export default function CameraScanRoute() {
  const [busy, setBusy] = useState(false);
  const pick = async (camera: boolean) => { if (busy) return; const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) { Alert.alert('Thiếu quyền truy cập', camera ? 'Vui lòng cấp quyền máy ảnh.' : 'Vui lòng cấp quyền thư viện ảnh.'); return; } const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 }); if (result.canceled || !result.assets[0]?.uri) return; setBusy(true); try { const candidates = await getNutritionRepository().scanMealImage(result.assets[0].uri); router.push({ pathname: '/nutrition/candidates-review' as never, params: { candidates: JSON.stringify(candidates) } }); } catch (e) { Alert.alert('Không thể nhận diện món ăn', e instanceof Error ? e.message : 'Vui lòng thử lại hoặc nhập thủ công.'); } finally { setBusy(false); } };
  return <ScreenContainer edges={['top', 'bottom']}><CameraScanPresentation onBack={() => router.back()} onCapture={() => void pick(true)} onPickGallery={() => void pick(false)} onManualEntryPress={() => router.push('/nutrition/manual-entry' as never)} isAiAvailable={!busy} /></ScreenContainer>;
}
