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
  Calendar,
  UserPlus,
  Sparkles,
  Bell,
  ArrowRight,
  Info,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { NotificationItemViewModel } from './supportTypes';

export interface NotificationsPresentationProps {
  notifications: NotificationItemViewModel[];
  onBack: () => void;
  onSelectNotification: (item: NotificationItemViewModel) => void;
}

export function NotificationsPresentation({
  notifications,
  onBack,
  onSelectNotification,
}: NotificationsPresentationProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead : true
  );

  const getCategoryIcon = (category: NotificationItemViewModel['category']) => {
    switch (category) {
      case 'booking':
        return <Calendar size={20} color={colors.primary} />;
      case 'social':
        return <UserPlus size={20} color="#3B82F6" />;
      case 'ai':
        return <Sparkles size={20} color={colors.warning} />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
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
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'unread' && styles.filterPillActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Chưa đọc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Không có thông báo nào</Text>
            <Text style={styles.emptySubtitle}>
              Các cập nhật về lịch tập, bạn bè và trợ lý Fitmate sẽ hiển thị tại đây.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelectNotification(item)}
              activeOpacity={0.8}
            >
              <Card
                style={[
                  styles.notificationCard,
                  !item.isRead && styles.notificationCardUnread,
                ]}
              >
                <View style={styles.iconContainer}>
                  {getCategoryIcon(item.category)}
                </View>

                <View style={styles.contentColumn}>
                  <View style={styles.topRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !item.isRead && styles.notificationTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <View style={styles.timeBadgeRow}>
                      <Text style={styles.timeText}>{item.timestamp}</Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                  </View>

                  <Text style={styles.bodyText}>{item.body}</Text>

                  {/* Destination hint */}
                  <View style={styles.destinationRow}>
                    <Text style={styles.destinationText}>
                      {item.targetType === 'booking'
                        ? 'Xem chi tiết lịch hẹn'
                        : item.targetType === 'friend_request'
                        ? 'Xem lời mời bạn bè'
                        : item.targetType === 'ai_plan'
                        ? 'Xem gợi ý điều chỉnh'
                        : 'Xem thông tin'}
                    </Text>
                    <ArrowRight size={12} color={colors.primary} />
                  </View>
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  notificationCardUnread: {
    backgroundColor: '#F0FDFA',
    borderColor: colors.primaryLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  bodyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  destinationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
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
});
