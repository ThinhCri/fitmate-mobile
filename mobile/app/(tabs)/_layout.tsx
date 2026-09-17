/**
 * Bottom tabs — 5 tab theo DEC-016 + screen-specs.
 * - Trang chu (Dashboard)
 * - Dinh duong (Nutrition)
 * - Tap luyen (Workout)
 * - Cong dong (Social)
 * - PT (Marketplace)
 */
import { Tabs } from 'expo-router';
import { Home, Apple, Dumbbell, Users, Briefcase } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const theme = useTheme();
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
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
