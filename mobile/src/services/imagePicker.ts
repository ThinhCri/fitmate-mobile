/**
 * ImagePickerService — graceful wrapper around expo-image-picker.
 *
 * If expo-image-picker is not installed, falls back to mock placeholders.
 * Returns { uri: string } on success or null if user cancels.
 */
import { Alert } from 'react-native';

export interface PickedImage {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  fileName?: string | null;
  mimeType?: string | null;
}

export interface PickImageOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

let pickerModule: typeof import('expo-image-picker') | null = null;
try {
  // Optional dep — wrapped try/catch so missing package doesn't crash app
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pickerModule = require('expo-image-picker');
} catch {
  pickerModule = null;
}

export const ImagePickerService = {
  async pickFromLibrary(options?: PickImageOptions): Promise<PickedImage | null> {
    if (!pickerModule) {
      Alert.alert(
        'Demo mode',
        'Chức năng chọn ảnh thật cần cài thêm expo-image-picker. Hiện đang dùng ảnh placeholder demo.',
      );
      return null;
    }
    const perm = await pickerModule.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Cần quyền truy cập thư viện ảnh', 'Vào Settings để cấp quyền.');
      return null;
    }
    const res = await pickerModule.launchImageLibraryAsync({
      mediaTypes: pickerModule.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? false,
      aspect: options?.aspect,
      quality: options?.quality ?? 0.8,
    });
    if (res.canceled || !res.assets?.[0]) return null;
    const asset = res.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    };
  },

  async pickFromCamera(): Promise<PickedImage | null> {
    if (!pickerModule) {
      Alert.alert('Demo mode', 'Camera chưa được cài đặt trong demo này.');
      return null;
    }
    const perm = await pickerModule.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Cần quyền camera', 'Vào Settings để cấp quyền camera.');
      return null;
    }
    const res = await pickerModule.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (res.canceled || !res.assets?.[0]) return null;
    return { uri: res.assets[0].uri, width: res.assets[0].width, height: res.assets[0].height };
  },

  isAvailable(): boolean {
    return pickerModule !== null;
  },
};

export default ImagePickerService;
