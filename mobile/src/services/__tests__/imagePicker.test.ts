import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerService } from '../imagePicker';

vi.mock('expo-image-picker', () => ({
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  requestMediaLibraryPermissionsAsync: vi.fn(),
  launchImageLibraryAsync: vi.fn(),
  getCameraPermissionsAsync: vi.fn(),
  requestCameraPermissionsAsync: vi.fn(),
  launchCameraAsync: vi.fn(),
}));

vi.mock('react-native', () => ({
  Alert: {
    alert: vi.fn(),
  },
}));

describe('ImagePickerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pickFromLibrary', () => {
    it('returns picked image when permission is granted and user selects an asset', async () => {
      vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
        granted: true,
        status: ImagePicker.PermissionStatus.GRANTED,
        expires: 'never',
        canAskAgain: true,
      });

      vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///data/certs/nasm.jpg',
            width: 1920,
            height: 1080,
            fileSize: 1024 * 500,
            fileName: 'nasm.jpg',
            mimeType: 'image/jpeg',
          },
        ],
      });

      const result = await ImagePickerService.pickFromLibrary({ allowsEditing: false });

      expect(result).toEqual({
        uri: 'file:///data/certs/nasm.jpg',
        width: 1920,
        height: 1080,
        fileSize: 512000,
        fileName: 'nasm.jpg',
        mimeType: 'image/jpeg',
      });
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsEditing: false,
          mediaTypes: ['images'],
        })
      );
    });

    it('fails closed and alerts user when media library permission is denied', async () => {
      vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
        granted: false,
        status: ImagePicker.PermissionStatus.DENIED,
        expires: 'never',
        canAskAgain: false,
      });

      const result = await ImagePickerService.pickFromLibrary();

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cần quyền truy cập thư viện ảnh',
        expect.stringContaining('Vui lòng cấp quyền truy cập')
      );
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('returns null when user cancels picker without selecting', async () => {
      vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
        granted: true,
        status: ImagePicker.PermissionStatus.GRANTED,
        expires: 'never',
        canAskAgain: true,
      });

      vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
        canceled: true,
        assets: null,
      });

      const result = await ImagePickerService.pickFromLibrary();
      expect(result).toBeNull();
    });
  });

  describe('pickFromCamera', () => {
    it('returns captured image when camera permission is granted', async () => {
      vi.mocked(ImagePicker.getCameraPermissionsAsync).mockResolvedValue({
        granted: true,
        status: ImagePicker.PermissionStatus.GRANTED,
        expires: 'never',
        canAskAgain: true,
      });
      vi.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
        granted: true,
        status: ImagePicker.PermissionStatus.GRANTED,
        expires: 'never',
        canAskAgain: true,
      });

      vi.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///data/camera/photo.jpg',
            width: 1200,
            height: 1600,
            fileSize: 1024 * 300,
            fileName: 'photo.jpg',
            mimeType: 'image/jpeg',
          },
        ],
      });

      const result = await ImagePickerService.pickFromCamera({ allowsEditing: false });

      expect(result).toEqual({
        uri: 'file:///data/camera/photo.jpg',
        width: 1200,
        height: 1600,
        fileSize: 307200,
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
      });
    });

    it('fails closed and alerts user when camera permission is denied', async () => {
      vi.mocked(ImagePicker.getCameraPermissionsAsync).mockResolvedValue({
        granted: false,
        status: ImagePicker.PermissionStatus.DENIED,
        expires: 'never',
        canAskAgain: false,
      });
      vi.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
        granted: false,
        status: ImagePicker.PermissionStatus.DENIED,
        expires: 'never',
        canAskAgain: false,
      });

      const result = await ImagePickerService.pickFromCamera();

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cần quyền máy ảnh',
        expect.stringContaining('Vui lòng cấp quyền sử dụng máy ảnh')
      );
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });
  });
});
