/**
 * ImagePickerService — production wrapper around expo-image-picker.
 *
 * Enforces production permissions, fail-closed error handling,
 * and preserves original image aspect ratio for certificate uploads.
 */
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

let cameraPermissionRequest: Promise<boolean> | null = null;

function showPermissionAlert(title: string, message: string) {
  Alert.alert(title, message, [
    { text: 'Để sau', style: 'cancel' },
    { text: 'Mở Cài đặt', onPress: () => void Linking.openSettings() },
  ]);
}

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

export const ImagePickerService = {
  async requestCameraPermission(openSettingsWhenBlocked = false): Promise<boolean> {
    if (cameraPermissionRequest) return cameraPermissionRequest;

    cameraPermissionRequest = (async () => {
      try {
        const current = await ImagePicker.getCameraPermissionsAsync();
        if (current.granted) return true;
        if (!current.canAskAgain) {
          if (openSettingsWhenBlocked) await Linking.openSettings();
          return false;
        }

        const requested = await ImagePicker.requestCameraPermissionsAsync();
        return requested.granted;
      } catch {
        return false;
      }
    })().finally(() => {
      cameraPermissionRequest = null;
    });

    return cameraPermissionRequest;
  },

  showCameraPermissionSettingsAlert(): void {
    showPermissionAlert(
      'Cần quyền máy ảnh',
      'Vui lòng cấp quyền sử dụng máy ảnh trong Cài đặt thiết bị để tiếp tục.'
    );
  },

  async pickFromLibrary(options?: PickImageOptions): Promise<PickedImage | null> {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showPermissionAlert(
          'Cần quyền truy cập thư viện ảnh',
          'Vui lòng cấp quyền truy cập thư viện hình ảnh trong Cài đặt thiết bị để tiếp tục.'
        );
        return null;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: options?.allowsEditing ?? false,
        aspect: options?.aspect,
        quality: options?.quality ?? 0.85,
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
    } catch {
      Alert.alert('Lỗi truy cập thư viện ảnh', 'Không thể khởi chạy thư viện hình ảnh.');
      return null;
    }
  },

  async pickMultipleFromLibrary(maxCount = 5, options?: PickImageOptions): Promise<PickedImage[]> {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showPermissionAlert(
          'Cần quyền truy cập thư viện ảnh',
          'Vui lòng cấp quyền truy cập thư viện hình ảnh trong Cài đặt thiết bị để tiếp tục.'
        );
        return [];
      }
      const selectionLimit = Math.max(1, Math.min(5, maxCount));
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit,
        quality: options?.quality ?? 0.85,
      });
      if (res.canceled || !res.assets) return [];
      return res.assets.slice(0, selectionLimit).map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      }));
    } catch {
      Alert.alert('Lỗi truy cập thư viện ảnh', 'Không thể khởi chạy thư viện hình ảnh.');
      return [];
    }
  },

  async pickFromCamera(options?: PickImageOptions): Promise<PickedImage | null> {
    try {
      const granted = await this.requestCameraPermission();
      if (!granted) {
        this.showCameraPermissionSettingsAlert();
        return null;
      }
      const res = await ImagePicker.launchCameraAsync({
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
    } catch {
      Alert.alert('Lỗi máy ảnh', 'Không thể khởi chạy máy ảnh trên thiết bị.');
      return null;
    }
  },

  isAvailable(): boolean {
    return true;
  },
};

export default ImagePickerService;
