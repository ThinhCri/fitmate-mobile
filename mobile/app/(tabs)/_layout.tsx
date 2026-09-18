/**
 * Bottom tabs — 5 tab theo DEC-016 + screen-specs.
 * - Trang chu (Dashboard)
 * - Dinh duong (Nutrition)
 * - Tap luyen (Workout)
 * - Cong dong (Social)
 * - PT (Marketplace)
 *
 * Safe area: gesture navigation Android co the che mat 48dp+ o cuoi man.
 * Dung SafeAreaView + useSafeAreaInsets() de tinh padding bottom thuc te.
 * Tab bar bg co the mo rong xuong vung gesture, nhung icon va label
 * nam trong vung tuong tac (paddingBottom = insets.bottom).
 */
import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Apple, Dumbbell, Users, Briefcase } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // State de tranh flicker khi insets chua kip tinh (treo 1 frame).
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    // Render tab bar don gian trong khi doi insets.
    return (
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="nutrition" />
        <Tabs.Screen name="workout" />
        <Tabs.Screen name="social" />
        <Tabs.Screen name="marketplace" />
      </Tabs>
    );
  }

  // Tong chieu cao tab bar = height(48) + paddingBottom(= insets.bottom de icon
  // nam tren gesture bar). Dat min 12dp vi thiet bi moi gap.
  const tabBarBottom = Math.max(insets.bottom, 12);
  const tabBarHeight = 48 + tabBarBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: resolveColor(theme, 'onPrimaryContainer'),
        tabBarInactiveTintColor: resolveColor(theme, 'onSurfaceVariant'),
        tabBarStyle: {
          backgroundColor: resolveColor(theme, 'surfaceContainerLowest'),
          borderTopColor: resolveColor(theme, 'outlineVariant'),
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarBottom,
          paddingTop: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        // An tab bar khi ban phim mo (noi dung duoc KeyboardAvoidingView xu ly).
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Dinh dưỡng',
          tabBarIcon: ({ color, size }) => <Apple color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Tập luyện',
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Cộng đồng',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'PT',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
