/** Food recognition is a local development demo, not an AI Plus benefit. */
export function isFoodScanDemoEnabled(isDevelopment = __DEV__): boolean {
  return isDevelopment && process.env.EXPO_PUBLIC_FOOD_SCAN_DEMO === 'true';
}
export const foodScanComingSoonMessage = 'Quét món ăn AI sắp ra mắt. Hiện chưa nằm trong quyền lợi AI Plus. Bạn vẫn có thể ghi bữa ăn thủ công.';
