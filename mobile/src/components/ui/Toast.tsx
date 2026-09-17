/**
 * Toast — top-positioned, 3s hold, success/warning/error/info/achievement variants.
 *
 * Phase UI: use ToastHost component at root + imperative API (Toast.show).
 */
import { useEffect, useState } from 'react';
import { Animated, View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export type ToastTone = 'success' | 'warning' | 'error' | 'info' | 'achievement';

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
    case 'achievement': bgKey = 'achievementContainer'; fgKey = 'onAchievementContainer'; borderKey = 'achievement'; break;
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

// ============================================================
// ToastHost + Toast.show imperative API
// ============================================================

interface ToastEntry {
  id: string;
  tone: ToastTone;
  message: string;
}

let queue: ToastEntry[] = [];
let listeners: Array<(entry: ToastEntry | null) => void> = [];

export const ToastService = {
  show(input: { message: string; tone?: ToastTone; durationMs?: number }) {
    const entry: ToastEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tone: input.tone ?? 'info',
      message: input.message,
    };
    queue.push(entry);
    const dur = input.durationMs ?? 3000;
    // Emit immediately and clear after duration.
    const showAndSchedule = (cb: (entry: ToastEntry | null) => void) => {
      cb(entry);
      setTimeout(() => {
        queue = queue.filter((e) => e.id !== entry.id);
        cb(queue[0] ?? null);
      }, dur);
    };
    listeners.forEach(showAndSchedule);
  },
};

export function ToastHost() {
  const [current, setCurrent] = useState<ToastEntry | null>(null);
  useEffect(() => {
    const cb = (entry: ToastEntry | null) => setCurrent(entry);
    listeners.push(cb);
    return () => {
      listeners = listeners.filter((l) => l !== cb);
    };
  }, []);
  if (!current) return null;
  return <Toast visible tone={current.tone} message={current.message} onHide={() => setCurrent(null)} />;
}
