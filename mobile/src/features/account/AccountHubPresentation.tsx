import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  HeartPulse,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  CheckCircle2,
  Bookmark,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { Avatar } from '@/components/design-system/Avatar';
import { AccountHubViewModel } from './accountTypes';

export interface AccountHubPresentationProps {
  account: AccountHubViewModel;
  onBack: () => void;
  onEditProfilePress: () => void;
  onAppointmentsPress: () => void;
  onPtSpacePress?: () => void;
  ptIsApproved?: boolean;
  onHealthProfilePress: () => void;
  onSettingsPress: () => void;
  onSupportPress: () => void;
  onSavedPostsPress: () => void;
  onAiPlanPress: () => void;
  onLogoutPress: () => void;
}

export function AccountHubPresentation({
  account,
  onBack,
  onEditProfilePress,
  onAppointmentsPress,
  onPtSpacePress,
  ptIsApproved,
  onHealthProfilePress,
  onSettingsPress,
  onSupportPress,
  onSavedPostsPress,
  onAiPlanPress,
  onLogoutPress,
}: AccountHubPresentationProps) {
  const isPt = account.role === 'pt';

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: onLogoutPress },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại Trang chủ"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Card */}
      <Card style={styles.profileHeaderCard}>
        <View style={styles.userRow}>
          <Avatar uri={account.avatarUrl} name={account.name} size="lg" />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{account.name}</Text>
              {account.isVerified && <CheckCircle2 size={16} color={colors.primary} />}
            </View>
            <Text style={styles.userEmail}>{account.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {isPt ? 'Huấn luyện viên PT' : 'Hội viên'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={onEditProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Chỉnh sửa hồ sơ cá nhân"
        >
          <Text style={styles.editProfileText}>Hồ sơ cá nhân &amp; Xem trước</Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </Card>

      {/* PT Space Banner (Strict: ONLY for PT role) */}
      {isPt && onPtSpacePress && (
        <TouchableOpacity onPress={onPtSpacePress} activeOpacity={0.9}>
          <Card style={styles.ptSpaceCard}>
            <View style={styles.ptSpaceHeader}>
              <View style={styles.ptIconBox}>
                <Briefcase size={20} color={colors.primary} />
              </View>
              <View style={styles.ptTextBox}>
                <Text style={styles.ptSpaceTitle}>{ptIsApproved ? 'Không gian Huấn luyện viên (PT)' : 'Hồ sơ Huấn luyện viên (PT)'}</Text>
                <Text style={styles.ptSpaceSub}>
                  {ptIsApproved ? 'Quản lý học viên, lịch dạy, chứng chỉ và doanh thu' : 'Bổ sung số liên hệ và chứng chỉ để được xét duyệt'}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.primary} />
            </View>
          </Card>
        </TouchableOpacity>
      )}

      {/* Section 1: Schedule */}
      {account.summaryUnavailable && <Text style={{ ...typography.caption, color: colors.textSecondary }}>
        Chưa có số liệu lịch hẹn đầy đủ. Bạn vẫn có thể mở Lịch hẹn của tôi để xem từng trang dữ liệu.
      </Text>}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch biểu</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={onAppointmentsPress}>
            <View style={styles.menuItemLeft}>
              <Calendar size={18} color={colors.primary} />
              <Text style={styles.menuItemText}>Lịch hẹn của tôi</Text>
            </View>
            <View style={styles.menuItemRight}>
              {account.upcomingBookingCount !== undefined &&
                account.upcomingBookingCount > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{account.upcomingBookingCount}</Text>
                  </View>
                )}
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nội dung</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={onAiPlanPress} accessibilityRole="button">
            <View style={styles.menuItemLeft}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={styles.menuItemText}>Gói AI của tôi</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={onSavedPostsPress}>
            <View style={styles.menuItemLeft}>
              <Bookmark size={18} color={colors.primary} />
              <Text style={styles.menuItemText}>Bài viết đã lưu</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Section 2: Personal Health & Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hồ sơ sức khỏe &amp; Hệ thống</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={onHealthProfilePress}>
            <View style={styles.menuItemLeft}>
              <HeartPulse size={18} color={colors.primary} />
              <Text style={styles.menuItemText}>Hồ sơ sức khỏe &amp; Lịch tập</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={onSettingsPress}>
            <View style={styles.menuItemLeft}>
              <Settings size={18} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Cài đặt ứng dụng &amp; Bảo mật</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={onSupportPress}>
            <View style={styles.menuItemLeft}>
              <HelpCircle size={18} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Trung tâm hỗ trợ &amp; Phản ánh</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Logout Row */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Đăng xuất tài khoản"
      >
        <LogOut size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  headerTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileHeaderCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  userInfo: {
    gap: 2,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  ptSpaceCard: {
    padding: spacing.md,
    backgroundColor: '#F0FDFA',
    borderColor: colors.primaryLight,
    borderWidth: 1,
  },
  ptSpaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ptIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptTextBox: {
    flex: 1,
    gap: 2,
  },
  ptSpaceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  ptSpaceSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  menuCard: {
    paddingHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  menuItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  badgePill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
});
