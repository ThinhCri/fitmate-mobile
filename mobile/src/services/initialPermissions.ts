import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';

const KEY_PREFIX = '@fitmate/initial-permissions/';

function keyFor(email: string): string {
  return KEY_PREFIX + email.trim().toLowerCase();
}

/**
 * Requests the two permissions needed by the Android app once per account.
 * A denial is remembered; later recovery is intentionally done from Settings.
 */
export async function requestInitialPermissionsOnce(email: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  const storageKey = keyFor(email);
  if ((await AsyncStorage.getItem(storageKey)) === 'done') return;

  try {
    if (Number(Platform.Version) >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Cho phép Fitmate gửi thông báo?',
          message: 'Fitmate dùng thông báo cho lịch tập, tin nhắn và cập nhật tài khoản.',
          buttonPositive: 'Cho phép',
          buttonNegative: 'Không cho phép',
        }
      );
    }

    const camera = await ImagePicker.getCameraPermissionsAsync();
    if (!camera.granted && camera.canAskAgain) {
      await ImagePicker.requestCameraPermissionsAsync();
    }
  } finally {
    // Do not repeatedly interrupt the user after they have made a choice.
    await AsyncStorage.setItem(storageKey, 'done');
  }
}

