import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  ChevronLeft,
  Search,
  MessageSquare,
  Users,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { Avatar } from '@/components/design-system/Avatar';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { ConversationItemViewModel } from './chatTypes';

export interface ChatInboxPresentationProps {
  conversations: ConversationItemViewModel[];
  onBack: () => void;
  onSelectConversation: (conversationId: string) => void;
  onFindFriendsPress: () => void;
}

export function ChatInboxPresentation({
  conversations,
  onBack,
  onSelectConversation,
  onFindFriendsPress,
}: ChatInboxPresentationProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === 'unread' && c.unreadCount === 0) return false;
    if (
      searchQuery.trim().length > 0 &&
      !c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

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
        <Text style={styles.headerTitle}>Hộp thư</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm cuộc trò chuyện..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'unread' && styles.filterPillActive]}
            onPress={() => setActiveFilter('unread')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'unread' && styles.filterPillTextActive,
              ]}
            >
              Chưa đọc
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversation List */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <MessageSquare size={36} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
            <Text style={styles.emptySubtitle}>
              Kết nối với bạn bè hoặc huấn luyện viên cá nhân để bắt đầu trao đổi lịch tập.
            </Text>
            <View style={styles.emptyActionWrapper}>
              <PrimaryButton
                label="Tìm bạn bè & HLV"
                onPress={onFindFriendsPress}
              />
            </View>
          </View>
        ) : (
          filteredConversations.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelectConversation(item.id)}
              activeOpacity={0.7}
            >
              <Card style={styles.conversationCard}>
                <View style={styles.avatarWrapper}>
                  <Avatar name={item.participantName} size="md" />
                  {item.participantRole === 'pt' && (
                    <View style={styles.ptBadge}>
                      <Text style={styles.ptBadgeText}>PT</Text>
                    </View>
                  )}
                  {item.isOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.detailsColumn}>
                  <View style={styles.nameTimeRow}>
                    <View style={styles.nameRow}>
                      <Text style={styles.nameText}>{item.participantName}</Text>
                      {item.isVerified && (
                        <CheckCircle2 size={14} color={colors.primary} />
                      )}
                    </View>
                    <Text style={styles.timeText}>{item.lastMessageTime}</Text>
                  </View>

                  <View style={styles.messageRow}>
                    <Text
                      style={[
                        styles.messageText,
                        item.unreadCount > 0 && styles.messageTextUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>

                  {item.sessionInfo && (
                    <View style={styles.sessionPill}>
                      <Calendar size={12} color={colors.primary} />
                      <Text style={styles.sessionPillText}>{item.sessionInfo}</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
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
  filterPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  ptBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  ptBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  detailsColumn: {
    flex: 1,
    gap: 2,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageText: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  messageTextUnread: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: 4,
  },
  sessionPillText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyActionWrapper: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 240,
  },
});
