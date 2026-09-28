/**
 * Stitch a01_ch_o_m_ng_default
 * Screen: Welcome / Onboarding Splash
 * Route: /(auth)/welcome
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import {
  Activity,
  CheckCircle2,
  Zap,
  ArrowRight,
  UserPlus,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';

export default function WelcomeScreen() {
  return (
    <ScreenContainer backgroundColor={colors.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand & Identity Cluster */}
        <View style={styles.brandCluster}>
          <View style={styles.brandPill}>
            <View style={styles.brandIconCircle}>
              <Activity size={15} color={colors.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandText}>FITMATE</Text>
          </View>

          <View style={styles.communityBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.communityText}>Hơn 45.000+ thành viên tích cực</Text>
          </View>
        </View>

        {/* Visual Framing: Athletic Lifestyle Illustration Box */}
        <View style={styles.visualCard}>
          {/* Subtle geometric background motif */}
          <View style={styles.cardBackdropCircle} />

          {/* Active Routine Sparkle Indicator (Top Right) */}
          <View style={styles.topRightChip}>
            <Zap size={14} color={colors.warning} fill={colors.warning} />
            <Text style={styles.topRightText}>Chuẩn bị sẵn sàng</Text>
          </View>

          {/* Center visual accent */}
          <View style={styles.centerGraphic}>
            <Activity size={56} color={colors.primary} strokeWidth={1.8} />
          </View>

          {/* Floating Achievement Chip (Bottom Left) */}
          <View style={styles.achievementChip}>
            <View style={styles.achievementIconCircle}>
              <CheckCircle2 size={16} color={colors.success} fill={colors.successLight} />
            </View>
            <View style={styles.achievementTexts}>
              <Text style={styles.achievementTitle}>Mục tiêu hôm nay</Text>
              <Text style={styles.achievementSubtitle}>100% khoa học & chuẩn y khoa</Text>
            </View>
          </View>
        </View>

        {/* Typography Hierarchy */}
        <View style={styles.textCluster}>
          <Text style={styles.title}>Khỏe hơn mỗi ngày</Text>
          <Text style={styles.description}>
            Đồng hành cùng bạn trên hành trình tập luyện khoa học, quản lý dinh dưỡng thông minh và kết nối huấn luyện viên chuyên nghiệp.
          </Text>
        </View>

        {/* Action Stack (Android ergonomic heights 52dp) */}
        <View style={styles.actionStack}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập"
          >
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
            <ArrowRight size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/register')}
            accessibilityRole="button"
            accessibilityLabel="Tạo tài khoản mới"
          >
            <UserPlus size={18} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>

        {/* Legal & Terms Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bằng việc tiếp tục, bạn đồng ý với{' '}
            <Text style={styles.footerLink}>Điều khoản dịch vụ</Text>
            {' '}và{' '}
            <Text style={styles.footerLink}>Chính sách riêng tư</Text>
            {' '}của Fitmate.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  brandCluster: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  brandIconCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  communityBadge: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  communityText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  visualCard: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardBackdropCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    opacity: 0.4,
  },
  centerGraphic: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  topRightChip: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  topRightText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  achievementChip: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementIconCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementTexts: {
    flexDirection: 'column',
  },
  achievementTitle: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  achievementSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  textCluster: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.display,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  actionStack: {
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  secondaryButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 16,
  },
  footer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
