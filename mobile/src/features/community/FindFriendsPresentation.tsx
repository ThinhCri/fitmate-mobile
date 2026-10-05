import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  ChevronLeft,
  Search,
  Users,
  UserCheck,
  UserPlus,
  X,
  Check,
  MessageCircle,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { Avatar } from '@/components/design-system/Avatar';
import { FriendItemViewModel } from './communityTypes';

export interface FindFriendsPresentationProps {
  friendsList: FriendItemViewModel[];
  pendingRequests: FriendItemViewModel[];
  sentRequests: FriendItemViewModel[];
  suggestedUsers: FriendItemViewModel[];
  searchResults: FriendItemViewModel[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
  onAcceptRequest: (friendId: string) => void;
  onRejectRequest: (friendId: string) => void;
  onCancelSentRequest: (friendId: string) => void;
  onSendRequest: (friendId: string) => void;
  onSelectUser: (userId: string) => void;
  onMessageUser?: (userId: string) => void;
}

export function FindFriendsPresentation({
  friendsList,
  pendingRequests,
  sentRequests,
  suggestedUsers,
  searchResults,
  searchQuery,
  onSearchChange,
  onBack,
  onAcceptRequest,
  onRejectRequest,
  onCancelSentRequest,
  onSendRequest,
  onSelectUser,
  onMessageUser,
}: FindFriendsPresentationProps) {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'friends' | 'requests' | 'sent'>('suggestions');
  const [roleFilter, setRoleFilter] = useState<'all' | 'member' | 'pt'>('all');

  const isSearching = searchQuery.trim().length > 0;

  const filterByRole = (items: FriendItemViewModel[]) => {
    if (roleFilter === 'all') return items;
    return items.filter((item) => item.role === roleFilter);
  };

  const currentTabItems = () => {
    switch (activeTab) {
      case 'suggestions':
        return filterByRole(suggestedUsers);
      case 'requests':
        return filterByRole(pendingRequests);
      case 'sent':
        return filterByRole(sentRequests);
      default:
        return filterByRole(friendsList);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm người & Bạn bè</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc ID thành viên..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Role Filter Chips */}
        <View style={styles.filterChipsRow}>
          <TouchableOpacity
            style={[styles.filterChip, roleFilter === 'all' && styles.filterChipActive]}
            onPress={() => setRoleFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                roleFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, roleFilter === 'member' && styles.filterChipActive]}
            onPress={() => setRoleFilter('member')}
          >
            <Text
              style={[
                styles.filterChipText,
                roleFilter === 'member' && styles.filterChipTextActive,
              ]}
            >
              Hội viên
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, roleFilter === 'pt' && styles.filterChipActive]}
            onPress={() => setRoleFilter('pt')}
          >
            <Text
              style={[
                styles.filterChipText,
                roleFilter === 'pt' && styles.filterChipTextActive,
              ]}
            >
              HLV PT
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher (Visible when not searching) */}
      {!isSearching && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'suggestions' && styles.tabBtnActive]}
            onPress={() => setActiveTab('suggestions')}
          >
            <Text style={[styles.tabText, activeTab === 'suggestions' && styles.tabTextActive]}>
              Gợi ý
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'friends' && styles.tabBtnActive]}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}
            >
              Bạn bè ({friendsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
            onPress={() => setActiveTab('requests')}
          >
            <View style={styles.badgeLabelRow}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'requests' && styles.tabTextActive,
                ]}
              >
                Lời mời
              </Text>
              {pendingRequests.length > 0 && (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>{pendingRequests.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'sent' && styles.tabBtnActive]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
              Đã gửi ({sentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List Content */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {isSearching ? (
          /* Search Results */
          <View style={styles.listSection}>
            <Text style={styles.listSectionTitle}>
              Kết quả tìm kiếm ({filterByRole(searchResults).length})
            </Text>
            {filterByRole(searchResults).length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Không tìm thấy người dùng phù hợp.</Text>
              </View>
            ) : (
              filterByRole(searchResults).map((item) => (
                <Card key={item.id} style={styles.userCard}>
                  <TouchableOpacity
                    style={styles.userInfoRow}
                    onPress={() => onSelectUser(item.id)}
                  >
                    <Avatar uri={item.avatarUrl} name={item.name} size="md" />
                    <View style={styles.userDetails}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{item.name}</Text>
                        {item.role === 'pt' && (
                          <View style={styles.ptBadge}>
                            <Text style={styles.ptBadgeText}>HLV</Text>
                          </View>
                        )}
                      </View>
                      {item.mutualFriendsCount !== undefined && item.mutualFriendsCount > 0 && (
                        <Text style={styles.mutualText}>
                          {item.mutualFriendsCount} bạn chung
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {item.relationship === 'friend' ? (
                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={() => onMessageUser && onMessageUser(item.id)}
                    >
                      <MessageCircle size={16} color={colors.primary} />
                      <Text style={styles.actionPillText}>Nhắn tin</Text>
                    </TouchableOpacity>
                  ) : item.relationship === 'received_request' ? (
                    <TouchableOpacity
                      style={styles.actionPillPrimary}
                      onPress={() => onAcceptRequest(item.id)}
                    >
                      <Check size={16} color="#FFFFFF" />
                      <Text style={styles.actionPillPrimaryText}>Chấp nhận</Text>
                    </TouchableOpacity>
                  ) : item.relationship === 'sent_request' ? (
                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={() => onCancelSentRequest(item.id)}
                    >
                      <Text style={styles.actionPillText}>Đã gửi</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionPillPrimary}
                      onPress={() => onSendRequest(item.id)}
                    >
                      <UserPlus size={16} color="#FFFFFF" />
                      <Text style={styles.actionPillPrimaryText}>Kết bạn</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              ))
            )}
          </View>
        ) : (
          /* Tab Items */
          <View style={styles.listSection}>
            {currentTabItems().length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  {activeTab === 'suggestions'
                    ? 'Chưa có gợi ý kết bạn mới.'
                    : activeTab === 'friends'
                    ? 'Bạn chưa kết nối với bạn bè nào. Thử tìm kiếm ở trên!'
                    : activeTab === 'requests'
                    ? 'Không có lời mời kết bạn nào đang chờ.'
                    : 'Chưa có lời mời kết bạn nào đã gửi.'}
                </Text>
              </View>
            ) : (
              currentTabItems().map((item) => (
                <Card key={item.id} style={styles.userCard}>
                  <TouchableOpacity
                    style={styles.userInfoRow}
                    onPress={() => onSelectUser(item.id)}
                  >
                    <Avatar uri={item.avatarUrl} name={item.name} size="md" />
                    <View style={styles.userDetails}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{item.name}</Text>
                        {item.role === 'pt' && (
                          <View style={styles.ptBadge}>
                            <Text style={styles.ptBadgeText}>HLV</Text>
                          </View>
                        )}
                      </View>
                      {item.isOnline && (
                        <Text style={styles.onlineStatus}>• Đang trực tuyến</Text>
                      )}
                      {item.mutualFriendsCount !== undefined && item.mutualFriendsCount > 0 && (
                        <Text style={styles.mutualText}>
                          {item.mutualFriendsCount} bạn chung
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Actions for current tab */}
                  {activeTab === 'suggestions' ? (
                    <TouchableOpacity
                      style={styles.actionPillPrimary}
                      onPress={() => onSendRequest(item.id)}
                    >
                      <UserPlus size={16} color="#FFFFFF" />
                      <Text style={styles.actionPillPrimaryText}>Kết bạn</Text>
                    </TouchableOpacity>
                  ) : activeTab === 'requests' ? (
                    <View style={styles.requestActionsRow}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => onRejectRequest(item.id)}
                      >
                        <Text style={styles.rejectBtnText}>Từ chối</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => onAcceptRequest(item.id)}
                      >
                        <Text style={styles.acceptBtnText}>Đồng ý</Text>
                      </TouchableOpacity>
                    </View>
                  ) : activeTab === 'sent' ? (
                    <TouchableOpacity
                      style={styles.cancelSentBtn}
                      onPress={() => onCancelSentRequest(item.id)}
                    >
                      <Text style={styles.cancelSentBtnText}>Hủy lời mời</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={() => onMessageUser && onMessageUser(item.id)}
                    >
                      <MessageCircle size={16} color={colors.primary} />
                      <Text style={styles.actionPillText}>Nhắn tin</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
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
  searchSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterBadge: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  counterBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  listSection: {
    gap: spacing.sm,
  },
  listSectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  userDetails: {
    gap: 2,
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ptBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 4,
    borderRadius: radius.xs,
  },
  ptBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  onlineStatus: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
  },
  mutualText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  actionPillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actionPillPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  actionPillPrimaryText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  requestActionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rejectBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  rejectBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  acceptBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  acceptBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelSentBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  cancelSentBtnText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
