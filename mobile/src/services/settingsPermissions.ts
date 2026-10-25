import { PermissionsAndroid, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type PermissionStatus = 'enabled' | 'disabled' | 'unknown';

export async function readSettingsPermissions(): Promise<{ notifications: PermissionStatus; camera: PermissionStatus }> {
  // Android <33 has no notification runtime permission; do not claim it is enabled.
  const notifications: Promise<PermissionStatus> = Platform.OS === 'android' && Number(Platform.Version) >= 33
    ? PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
      .then((granted) => granted ? 'enabled' as const : 'disabled' as const).catch(() => 'unknown' as const)
    : Promise.resolve('unknown');
  const camera: Promise<PermissionStatus> = ImagePicker.getCameraPermissionsAsync()
    .then((permission) => permission.granted ? 'enabled' as const : 'disabled' as const)
    .catch(() => 'unknown' as const);
  const [notificationStatus, cameraStatus] = await Promise.all([notifications, camera]);
  return { notifications: notificationStatus, camera: cameraStatus };
}
