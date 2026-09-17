/**
 * Toast — top-positioned, 3s hold, success/warning/error/info variants.
 *
 * Phase UI: use ToastHost component at root + imperative API.
 */
import { useEffect } from 'react';
import { Animated, View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export type ToastTone = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  tone: ToastTone;
  message: string;
  onHide: () => void;
  durationMs?: number;
}

export function Toast({ visible, tone, message, onHide, durationMs = 3000 }: ToastProps) {
  const theme = useTheme();
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide());
      }, durationMs);
      return () => clearTimeout(timer);
    }
    return;
  }, [visible, durationMs, translateY, opacity, onHide]);

  if (!visible) return null;

  let bgKey: keyof typeof theme.tokens.palette;
  let fgKey: keyof typeof theme.tokens.palette;
  let borderKey: keyof typeof theme.tokens.palette | null;

  switch (tone) {
    case 'success': bgKey = 'surfaceContainerLowest'; fgKey = 'success'; borderKey = 'success'; break;
    case 'warning': bgKey = 'surfaceContainerLowest'; fgKey = 'warning'; borderKey = 'warning'; break;
    case 'error': bgKey = 'errorContainer'; fgKey = 'onErrorContainer'; borderKey = null; break;
    case 'info': bgKey = 'surfaceContainerLowest'; fgKey = 'info'; borderKey = 'info'; break;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: resolveColor(theme, bgKey),
          borderColor: borderKey ? resolveColor(theme, borderKey) : 'transparent',
          borderWidth: borderKey ? 1 : 0,
          borderRadius: theme.tokens.radius.md,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: resolveColor(theme, fgKey), fontSize: 14, fontWeight: '600', flex: 1 }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
