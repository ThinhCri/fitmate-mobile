import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { ImagePickerService } from '@/services/imagePicker';

const KEY_PREFIX = '@fitmate/initial-permissions/';
const inFlightRequests = new Map<string, Promise<void>>();

function keyFor(email: string): string {
  return KEY_PREFIX + email.trim().toLowerCase();
}

export async function requestNotificationPermission(
  openSettingsWhenBlocked = false
): Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) return true;

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (await PermissionsAndroid.check(permission)) return true;

  const result = await PermissionsAndroid.request(permission);
  if (
    result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
    openSettingsWhenBlocked
  ) {
    await Linking.openSettings();
  }

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Runs the one-time post-registration permission onboarding for an account.
 * The Dashboard calls this only after its authenticated UI is visible.
 */
export async function requestInitialPermissionsOnce(email: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  const storageKey = keyFor(email);
  const existingRequest = inFlightRequests.get(storageKey);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    if ((await AsyncStorage.getItem(storageKey)) !== null) return;

    // Persist before opening the Android dialog so re-renders cannot start a
    // second request while the first system dialog is still visible.
    await AsyncStorage.setItem(storageKey, 'requested');

    // Ask sequentially so Android never stacks two system permission dialogs.
    await requestNotificationPermission(false);
    await ImagePickerService.requestCameraPermission(false);
  })().finally(() => {
    inFlightRequests.delete(storageKey);
  });

  inFlightRequests.set(storageKey, request);
  return request;
}

