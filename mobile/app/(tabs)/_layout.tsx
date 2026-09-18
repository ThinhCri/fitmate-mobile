/**
 * Bottom tabs — 5 tab theo DEC-016 + screen-specs.
 * - Trang chu (Dashboard)
 * - Dinh duong (Nutrition)
 * - Tap luyen (Workout)
 * - Cong dong (Social)
 * - PT (Marketplace)
 *
 * DEC-024 (2026-09-18): custom FloatingTabBar pill.
 *  - Bo tab bar mac dinh cua expo-router (border-top, full-width).
 *  - Floating pill cach 2 canh man hinh 16dp, glass + BlurView.
 *  - Safe area: bottom pad = insets.bottom + 8dp.
 *  - Hide on keyboard open.
 *  - Selected tab co capsule primaryContainer phia sau icon (khong chi thay mau).
 *  - Fallback: surface dac neu BlurView khong ho tro.
 *
 * Note: expo-router 4+ Tabs.Screen options `tabBar` (custom function) accepted
 * at runtime nhung TS type chua expose, nen cast `as never`.
 */
import { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Home, Apple, Dumbbell, Users, Briefcase } from 'lucide-react-native';
import { FloatingTabBar, type TabItem } from '@/components/ui';

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } } as never}>
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="nutrition" />
        <Tabs.Screen name="workout" />
        <Tabs.Screen name="social" />
        <Tabs.Screen name="marketplace" />
      </Tabs>
    );
  }

  const activeRoute = segments[segments.length - 1] ?? 'dashboard';

  const tabs: TabItem[] = [
    {
      key: 'dashboard',
      label: 'Trang chủ',
      icon: ({ color, size, filled }) => (
        <Home color={color} size={size} fill={filled ? color : 'transparent'} strokeWidth={filled ? 2 : 1.75} />
      ),
      active: activeRoute === 'dashboard',
      onPress: () => router.push('/(tabs)/dashboard' as never),
      accessibilityLabel: 'Trang chủ',
    },
    {
      key: 'nutrition',
      label: 'Dinh dưỡng',
      icon: ({ color, size, filled }) => (
        <Apple color={color} size={size} fill={filled ? color : 'transparent'} strokeWidth={filled ? 2 : 1.75} />
      ),
      active: activeRoute === 'nutrition',
      onPress: () => router.push('/(tabs)/nutrition' as never),
      accessibilityLabel: 'Dinh dưỡng',
    },
    {
      key: 'workout',
      label: 'Tập luyện',
      icon: ({ color, size, filled }) => (
        <Dumbbell color={color} size={size} fill={filled ? color : 'transparent'} strokeWidth={filled ? 2 : 1.75} />
      ),
      active: activeRoute === 'workout',
      onPress: () => router.push('/(tabs)/workout' as never),
      accessibilityLabel: 'Tập luyện',
    },
    {
      key: 'social',
      label: 'Cộng đồng',
      icon: ({ color, size, filled }) => (
        <Users color={color} size={size} fill={filled ? color : 'transparent'} strokeWidth={filled ? 2 : 1.75} />
      ),
      active: activeRoute === 'social',
      onPress: () => router.push('/(tabs)/social' as never),
      accessibilityLabel: 'Cộng đồng',
    },
    {
      key: 'marketplace',
      label: 'PT',
      icon: ({ color, size, filled }) => (
        <Briefcase color={color} size={size} fill={filled ? color : 'transparent'} strokeWidth={filled ? 2 : 1.75} />
      ),
      active: activeRoute === 'marketplace',
      onPress: () => router.push('/(tabs)/marketplace' as never),
      accessibilityLabel: 'PT',
    },
  ];

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true } as never}
    >
      <Tabs.Screen name="dashboard" options={{ tabBar: () => <FloatingTabBar tabs={tabs} /> } as never} />
      <Tabs.Screen name="nutrition" options={{ tabBar: () => <FloatingTabBar tabs={tabs} /> } as never} />
      <Tabs.Screen name="workout" options={{ tabBar: () => <FloatingTabBar tabs={tabs} /> } as never} />
      <Tabs.Screen name="social" options={{ tabBar: () => <FloatingTabBar tabs={tabs} /> } as never} />
      <Tabs.Screen name="marketplace" options={{ tabBar: () => <FloatingTabBar tabs={tabs} /> } as never} />
    </Tabs>
  );
}
