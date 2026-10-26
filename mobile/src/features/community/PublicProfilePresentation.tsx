import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  MoreVertical,
  CheckCircle2,
  UserPlus,
  UserCheck,
  UserMinus,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  Flame,
  FileText,
  Award,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { Avatar } from '@/components/design-system/Avatar';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { ModalShell } from '@/components/design-system/ModalShell';
import {
  UserPublicProfileViewModel,
  CommunityPostViewModel,
} from './communityTypes';

export interface PublicProfilePresentationProps {
  profile: UserPublicProfileViewModel;
  isSelf?: boolean;
  onBack: () => void;
  onSendFriendRequest: () => void;
  onCancelFriendRequest: () => void;
  onAcceptFriendRequest: () => void;
  onRejectFriendRequest: () => void;
  onUnfriend: () => void;
  onMessagePress: () => void;
  onViewPtProfile?: (ptId: string) => void;
  onSelectPost: (postId: string) => void;
  onLoadMorePosts?: () => void;
  loadingPosts?: boolean;
  postsError?: string;
  onReportPress: () => void;
  onBlockPress: () => void;
}

export function PublicProfilePresentation({
  profile,
  isSelf = false,
  onBack,
  onSendFriendRequest,
  onCancelFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onUnfriend,
  onMessagePress,
  onViewPtProfile,
  onSelectPost,
  onLoadMorePosts,
  loadingPosts,
  postsError,
  onReportPress,
  onBlockPress,
}: PublicProfilePresentationProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'badges'>('posts');
  const [showFriendMenu, setShowFriendMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const renderRelationshipButtons = () => {
    if (isSelf) return null;

    switch (profile.friendshipStatus) {
      case 'none':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.addFriendBtn}
              onPress={onSendFriendRequest}
              accessibilityRole="button"
              accessibilityLabel="Kết bạn"
            >
              <UserPlus size={18} color="#FFFFFF" />
              <Text style={styles.addFriendBtnText}>Kết bạn</Text>
            </TouchableOpacity>
          </View>
        );

      case 'request_sent':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelRequestBtn}
              onPress={onCancelFriendRequest}
              accessibilityRole="button"
              accessibilityLabel="Hủy lời mời"
            >
              <Text style={styles.cancelRequestBtnText}>Hủy lời mời</Text>
            </TouchableOpacity>
          </View>
        );

      case 'request_received':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={onRejectFriendRequest}
              accessibilityRole="button"
              accessibilityLabel="Từ chối lời mời"
            >
              <Text style={styles.rejectBtnText}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={onAcceptFriendRequest}
              accessibilityRole="button"
              accessibilityLabel="Chấp nhận lời mời"
            >
              <Text style={styles.acceptBtnText}>Chấp nhận</Text>
            </TouchableOpacity>
          </View>
        );

      case 'friend':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.friendStatusPill}
              onPress={() => setShowFriendMenu(true)}
              accessibilityRole="button"
              accessibilityLabel="Quan hệ bạn bè"
            >
              <UserCheck size={18} color={colors.primary} />
              <Text style={styles.friendStatusText}>Bạn bè</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageBtn}
              onPress={onMessagePress}
              accessibilityRole="button"
              accessibilityLabel="Nhắn tin"
            >
              <MessageCircle size={18} color="#FFFFFF" />
              <Text style={styles.messageBtnText}>Nhắn tin</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        {!isSelf ? (
          <TouchableOpacity
            onPress={() => setShowMoreMenu(true)}
            style={styles.iconBtn}
            accessibilityLabel="Tùy chọn"
            accessibilityRole="button"
          >
            <MoreVertical size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <Avatar name={profile.name} uri={profile.avatarUrl} size="lg" />
            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{profile.name}</Text>
                {profile.isVerified && <CheckCircle2 size={16} color={colors.primary} />}
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {profile.role === 'pt' ? 'Huấn luyện viên PT' : 'Hội viên'}
                </Text>
              </View>
            </View>
          </View>

          {profile.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.friendCount ?? '—'}</Text>
              <Text style={styles.statLabel}>Bạn bè</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.postCount ?? '—'}</Text>
              <Text style={styles.statLabel}>Bài viết hiển thị</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.fireStatRow}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {profile.completedWorkoutsCount ?? '—'}
                </Text>
                <Flame size={14} color={colors.warning} />
              </View>
              <Text style={styles.statLabel}>Buổi tập</Text>
            </View>
          </View>

          {/* PT Professional Profile Link */}
          {profile.role === 'pt' && profile.ptProfileId && onViewPtProfile && (
            <TouchableOpacity
              style={styles.ptProfileLink}
              onPress={() => onViewPtProfile(profile.ptProfileId!)}
            >
              <ExternalLink size={16} color={colors.primary} />
              <Text style={styles.ptProfileLinkText}>Xem hồ sơ HLV chuyên nghiệp & Đặt lịch</Text>
            </TouchableOpacity>
          )}

          {/* Relationship Buttons */}
          {renderRelationshipButtons()}
        </Card>

        {/* Tab Controls */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('posts')}
          >
            <FileText
              size={16}
              color={activeTab === 'posts' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}
            >
              Bài viết ({profile.posts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'badges' && styles.tabBtnActive]}
            onPress={() => setActiveTab('badges')}
          >
            <Award
              size={16}
              color={activeTab === 'badges' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}
            >
              Huy hiệu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          <View style={styles.postsList}>
            {profile.posts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>{profile.postsUnavailable ? 'Chưa hỗ trợ tải bài viết theo hồ sơ này. Bạn có thể xem các bài viết được phép hiển thị tại Cộng đồng.' : 'Chưa có bài viết công khai nào.'}</Text>
              </View>
            ) : (
              profile.posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  onPress={() => onSelectPost(post.id)}
                  activeOpacity={0.8}
                >
                  <Card style={styles.postItemCard}>
                    <Text style={styles.postDate}>{post.createdAt}</Text>
                    <Text style={styles.postItemContent} numberOfLines={3}>
                      {post.content}
                    </Text>
                    <View style={styles.postItemFooter}>
                      <Text style={styles.postItemReaction}>
                        ❤️ {post.reactions.love}  🔥 {post.reactions.fire}
                      </Text>
                      <Text style={styles.postItemComments}>
                        {post.commentCount} bình luận
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
            {postsError ? <Text accessibilityRole="alert" style={{ color: colors.danger }}>{postsError}</Text> : null}
            {profile.postsNextCursor && onLoadMorePosts && <TouchableOpacity accessibilityRole="button" disabled={loadingPosts}
              onPress={onLoadMorePosts} style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.primary }}>{loadingPosts ? 'Đang tải...' : postsError ? 'Thử tải lại' : 'Xem thêm bài viết'}</Text>
            </TouchableOpacity>}
          </View>
        ) : (
          <View style={styles.badgesList}>
            <Text style={styles.emptyText}>Chưa có dữ liệu huy hiệu từ hệ thống.</Text>
          </View>
        )}
      </ScrollView>

      {/* Friend Options Menu Modal */}
      <ModalShell
        visible={showFriendMenu}
        onClose={() => setShowFriendMenu(false)}
        title="Tùy chọn bạn bè"
      >
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowFriendMenu(false);
              Alert.alert('Xác nhận', `Bạn có chắc muốn hủy kết bạn với ${profile.name}?`, [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Hủy kết bạn', style: 'destructive', onPress: onUnfriend },
              ]);
            }}
          >
            <UserMinus size={20} color={colors.danger} />
            <Text style={[styles.menuItemText, { color: colors.danger }]}>Hủy kết bạn</Text>
          </TouchableOpacity>
        </View>
      </ModalShell>

      {/* Overflow More Menu Modal */}
      <ModalShell
        visible={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        title="Tùy chọn người dùng"
      >
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMoreMenu(false);
              onReportPress();
            }}
          >
            <ShieldAlert size={20} color={colors.warning} />
            <Text style={styles.menuItemText}>Báo cáo vi phạm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMoreMenu(false);
              onBlockPress();
            }}
          >
            <Text style={[styles.menuItemText, { color: colors.danger }]}>Chặn người dùng</Text>
          </TouchableOpacity>
        </View>
      </ModalShell>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  profileCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nameContainer: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    ...typography.title1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  roleBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  bioText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  fireStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  ptProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
  },
  ptProfileLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addFriendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  addFriendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelRequestBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  cancelRequestBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  rejectBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  acceptBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  friendStatusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  friendStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  messageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  postsList: {
    gap: spacing.sm,
  },
  postItemCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  postDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  postItemContent: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  postItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  postItemReaction: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  postItemComments: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  badgesList: {
    gap: spacing.sm,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  badgeInfo: {
    gap: 2,
  },
  badgeName: {
    ...typography.title3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  badgeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  menuList: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  menuItemText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
