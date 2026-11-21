/**
 * Patches React Native StyleSheet.create to track created styles
 * and dynamically update colors when switching between Light and Dark themes.
 */
import { StyleSheet } from 'react-native';
import { registerStyleSheetForTheming } from './designTokens';

if (!(StyleSheet as any).__isFitmatePatched) {
  const originalCreate = StyleSheet.create;
  (StyleSheet as any).create = function (styles: any) {
    const created = originalCreate(styles);
    if (created && typeof created === 'object') {
      registerStyleSheetForTheming(created);
    }
    return created;
  };
  (StyleSheet as any).__isFitmatePatched = true;
}
