/**
 * Modals layout — sheet-style full-screen modals.
 */
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return <Stack screenOptions={{ headerShown: false, presentation: 'modal' }} />;
}
