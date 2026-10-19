import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/theme/designTokens';
import { BrandMark } from './BrandMark';

type AuthIntroProps = { title: string; subtitle: string };

export function AuthIntro({ title, subtitle }: AuthIntroProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) progress.setValue(1);
      else Animated.timing(progress, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    }).catch(() => { if (mounted) progress.setValue(1); });
    return () => { mounted = false; progress.stopAnimation(); };
  }, [progress]);

  return (
    <Animated.View style={[styles.container, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
      <BrandMark compact />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xxl },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 22 },
});
