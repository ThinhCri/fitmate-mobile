/**
 * FloatingTabBar — pill tab bar nổi với BlurView.
 *
 * DEC-024 (2026-09-18): bottom navigation chuyển sang floating pill.
 *  - Bo tròn canh vien (pill), cách 2 canh man hinh 16dp.
 *  - Glass surface (white #FFFFFF opacity 0.75) + BlurView intensity 25-30.
 *  - Viền 1dp outlineVariant + shadow nhe (level2).
 *  - Tab chọn: capsule bg primaryContainer + icon onPrimaryContainer, label primary.
 *  - Tab không chọn: icon onSurfaceVariant, label onSurfaceVariant.
 *  - Safe area: padding bottom = insets.bottom + 12dp.
 *  - Fallback: neu BlurView khong ho tro, surface dac van co glass feel.
 */
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { useTabBarVisibility } from '@/context/TabBarVisibilityContext';

export interface TabItem {
  key: string;
  label: string;
  icon: (props: { color: string; size: number; filled: boolean }) => React.ReactNode;
  badgeCount?: number;
  active: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

export interface FloatingTabBarProps {
  tabs: TabItem[];
}

const HORIZONTAL_MARGIN = 16;
const PILL_HEIGHT = 64;
const PILL_PADDING = 6;

export function FloatingTabBar({ tabs }: FloatingTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [blurSupported, setBlurSupported] = useState(true);
  const { animProgress, isVisible } = useTabBarVisibility();

  useEffect(() => {
    // BlurView on Android often falls back; we test mount to decide on fallback.
    setBlurSupported(Platform.OS !== 'web');
  }, []);

  // Padding bottom de tab bar khong bi gesture bar de len.
  const bottomPad = Math.max(insets.bottom, 12) + 8;
  const baseSurface = resolveColor(theme, 'glassSurface');
  const borderColor = resolveColor(theme, 'outlineVariant');

  // Khoang cach truot xuong duoi mep man hinh de an hoan toan (chieu cao pill + padding an toan)
  const hideDistance = PILL_HEIGHT + bottomPad + 32;
  const translateY = animProgress
    ? animProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, hideDistance],
      })
    : 0;

  return (
    <Animated.View
      pointerEvents={isVisible ? 'box-none' : 'none'}
      style={[
        styles.container,
        {
          paddingBottom: bottomPad,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: blurSupported ? 'transparent' : baseSurface,
            borderColor,
            ...theme.tokens.elevation.level2,
          },
        ]}
      >
        {blurSupported ? (
          <BlurView
            intensity={Platform.OS === 'android' ? 28 : 30}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {/* Soft tint overlay de tang do "trang mo" cua glass */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: baseSurface, opacity: 0.55 },
          ]}
        />

        <View style={[styles.row, { padding: PILL_PADDING }]}>
          {tabs.map((t) => (
            <TabButton key={t.key} item={t} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function TabButton({ item }: { item: TabItem }) {
  const theme = useTheme();

  const tintActive = resolveColor(theme, 'onPrimaryContainer');
  const tintInactive = resolveColor(theme, 'onSurfaceVariant');
  const tintIcon = item.active ? tintActive : tintInactive;
  const bgPillActive = resolveColor(theme, 'primaryContainer');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.accessibilityLabel}
      accessibilityState={{ selected: item.active }}
      hitSlop={4}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.tab,
        {
          opacity: pressed ? theme.tokens.opacity.pressed : 1,
        },
      ]}
    >
      {item.active ? (
        <View style={[styles.activePill, { backgroundColor: bgPillActive }]}>
          {item.icon({ color: tintIcon, size: 22, filled: true })}
        </View>
      ) : (
        <View style={styles.iconWrap}>
          {item.icon({ color: tintIcon, size: 22, filled: false })}
        </View>
      )}
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10.5,
          fontWeight: item.active ? '700' : '600',
          color: tintIcon,
          marginTop: 4,
        }}
      >
        {item.label}
      </Text>
      {item.badgeCount && item.badgeCount > 0 ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: resolveColor(theme, 'error') },
          ]}
        >
          <Text style={styles.badgeText}>
            {item.badgeCount > 9 ? '9+' : item.badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  pill: {
    width: `${100 - (HORIZONTAL_MARGIN * 2 / 4) * 1}%`, // explicit width below
    borderRadius: PILL_HEIGHT / 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    position: 'relative',
  },
  activePill: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
