import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import {
  Utensils,
  Dumbbell,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { colors, radius, shadow, spacing, typography } from '@/theme/designTokens';

/**
 * DashboardScreen (Production Route)
 *
 * STATUS: CONTRACT_GAP recorded.
 * Backend OpenAPI (fitmate-v1.yaml) does not currently provide an atomic
 * aggregate dashboard endpoint. In accordance with production guidelines,
 * this production route does NOT import development preview fixtures.
 *
 * Visual Stitch presentation can be viewed in __DEV__ via /sample-preview.
 */
export default function DashboardScreen() {
  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar title="Trang chủ" hideDivider />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.noticeCard, shadow.card]}>
          <View style={styles.noticeHeader}>
            <View style={styles.warningIconCircle}>
              <AlertTriangle size={22} color={colors.warning} />
            </View>
            <View style={styles.noticeTitleCol}>
              <Text style={[typography.title3, styles.noticeTitle]}>
                Đang chờ đồng bộ dữ liệu tổng hợp
              </Text>
              <Text style={[typography.caption, styles.contractGapBadge]}>
                CONTRACT_GAP (Backend Release 1.0)
              </Text>
            </View>
          </View>
          <Text style={[typography.body, styles.noticeText]}>
            Máy chủ chưa cung cấp API tổng hợp dữ liệu ngày hôm nay. Dữ liệu tập luyện,
            dinh dưỡng và huấn luyện viên đang được xử lý độc lập qua từng phân hệ chuyên biệt.
          </Text>

          {__DEV__ && (
            <TouchableOpacity
              style={styles.devPreviewBanner}
              onPress={() => router.push('/sample-preview')}
              accessibilityRole="button"
            >
              <Sparkles size={18} color={colors.primaryDark} />
              <Text style={[typography.bodyBold, styles.devPreviewText]}>
                Xem thiết kế mẫu Stitch (B01 Preview)
              </Text>
              <ArrowRight size={16} color={colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[typography.title3, styles.sectionTitle]}>
          Truy cập các tính năng khả dụng
        </Text>

        <TouchableOpacity
          style={[styles.moduleCard, shadow.card]}
          onPress={() => router.push('/(tabs)/marketplace')}
          activeOpacity={0.7}
        >
          <View style={[styles.moduleIconBox, { backgroundColor: colors.primaryLight }]}>
            <Users size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.moduleInfoCol}>
            <Text style={[typography.bodyBold, styles.moduleTitle]}>
              Huấn luyện viên (Marketplace)
            </Text>
            <Text style={[typography.caption, styles.moduleSubtitle]}>
              Danh sách PT từ API /trainers thật, lọc theo chuyên môn và giá.
            </Text>
          </View>
          <ArrowRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.moduleCard, shadow.card]}
          onPress={() => router.push('/(tabs)/nutrition')}
          activeOpacity={0.7}
        >
          <View style={[styles.moduleIconBox, { backgroundColor: colors.infoLight }]}>
            <Utensils size={22} color={colors.info} />
          </View>
          <View style={styles.moduleInfoCol}>
            <Text style={[typography.bodyBold, styles.moduleTitle]}>
              Nhật ký dinh dưỡng
            </Text>
            <Text style={[typography.caption, styles.moduleSubtitle]}>
              Theo dõi bữa ăn và lượng calo nạp vào hàng ngày.
            </Text>
          </View>
          <ArrowRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.moduleCard, shadow.card]}
          onPress={() => router.push('/(tabs)/workout')}
          activeOpacity={0.7}
        >
          <View style={[styles.moduleIconBox, { backgroundColor: colors.warningLight }]}>
            <Dumbbell size={22} color="#D97706" />
          </View>
          <View style={styles.moduleInfoCol}>
            <Text style={[typography.bodyBold, styles.moduleTitle]}>
              Kế hoạch tập luyện
            </Text>
            <Text style={[typography.caption, styles.moduleSubtitle]}>
              Xem lịch trình buổi tập và các bài tập được chỉ định.
            </Text>
          </View>
          <ArrowRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 96,
  },
  noticeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  warningIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  noticeTitleCol: {
    flex: 1,
  },
  noticeTitle: {
    color: colors.textPrimary,
  },
  contractGapBadge: {
    color: '#B45309',
    fontWeight: '600',
    marginTop: 2,
  },
  noticeText: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  devPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  devPreviewText: {
    color: colors.primaryDark,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moduleIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  moduleInfoCol: {
    flex: 1,
  },
  moduleTitle: {
    color: colors.textPrimary,
  },
  moduleSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
