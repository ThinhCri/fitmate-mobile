import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { BrandMark } from '@/features/auth/BrandMark';
import { setHasSeenWelcome } from '@/services/storage';

export default function WelcomeScreen() {
  const logo = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        logo.setValue(1);
        content.setValue(1);
      } else {
        Animated.sequence([
          Animated.timing(logo, { toValue: 1, duration: 360, useNativeDriver: true }),
          Animated.timing(content, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    }).catch(() => { if (mounted) { logo.setValue(1); content.setValue(1); } });
    return () => { mounted = false; logo.stopAnimation(); content.stopAnimation(); };
  }, [logo, content]);

  const navigate = (destination: '/(auth)/login' | '/(auth)/register') => {
    setHasSeenWelcome(true);
    router.push(destination);
  };

  return (
    <ScreenContainer backgroundColor={colors.background}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Animated.View style={{ opacity: logo, transform: [{ translateY: logo.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
            <BrandMark />
          </Animated.View>
          <Animated.View style={[styles.message, { opacity: content, transform: [{ translateY: content.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
            <Text style={styles.title}>Khỏe hơn mỗi ngày.</Text>
            <Text style={styles.description}>Theo dõi dinh dưỡng, tập luyện và kết nối huấn luyện viên trong một nơi.</Text>
          </Animated.View>
        </View>
        <Animated.View style={[styles.actions, { opacity: content }]}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigate('/(auth)/register')} accessibilityRole="button" accessibilityLabel="Bắt đầu tạo tài khoản">
            <Text style={styles.primaryText}>Bắt đầu</Text>
            <ArrowRight size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigate('/(auth)/login')} accessibilityRole="button" accessibilityLabel="Đăng nhập">
            <Text style={styles.secondaryText}>Tôi đã có tài khoản</Text>
          </TouchableOpacity>
          <Text style={styles.legal}>Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách riêng tư của Fitmate.</Text>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', minHeight: 310 },
  message: { marginTop: 44 },
  title: { ...typography.display, fontSize: 34, lineHeight: 42, color: colors.textPrimary },
  description: { ...typography.body, fontSize: 16, lineHeight: 24, color: colors.textSecondary, marginTop: spacing.md, maxWidth: 330 },
  actions: { gap: spacing.md },
  primaryButton: { height: 54, borderRadius: radius.lg, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  primaryText: { ...typography.bodyBold, fontSize: 16, color: colors.white },
  secondaryButton: { height: 54, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { ...typography.bodyBold, fontSize: 16, color: colors.primaryDark },
  legal: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', lineHeight: 19, marginTop: spacing.sm },
});
