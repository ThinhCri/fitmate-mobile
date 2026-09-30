import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  ShieldCheck,
  Star,
  Calendar,
  Clock,
  Briefcase,
  Award,
  DollarSign,
  ChevronRight,
  AlertTriangle,
  Users,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';

export interface PtOverviewPresentationProps {
  ptName: string;
  isVerified: boolean;
  certificateName: string;
  rating: number;
  reviewCount: number;
  isAcceptingClients: boolean;
  pendingTasks: { id: string; title: string; type: 'warning' | 'info'; linkTarget: string }[];
  upcomingSessions: {
    id: string;
    clientName: string;
    serviceName: string;
    timeString: string;
    location: string;
  }[];
  onToggleStatus: () => void;
  onNavigateToServices: () => void;
  onNavigateToSchedule: () => void;
  onNavigateToCertificates: () => void;
  onNavigateToSessions: () => void;
  onNavigateToRevenue: () => void;
  onSelectSession: (id: string) => void;
}

export function PtOverviewPresentation({
  ptName,
  isVerified,
  certificateName,
  rating,
  reviewCount,
  isAcceptingClients,
  pendingTasks,
  upcomingSessions,
  onToggleStatus,
  onNavigateToServices,
  onNavigateToSchedule,
  onNavigateToCertificates,
  onNavigateToSessions,
  onNavigateToRevenue,
  onSelectSession,
}: PtOverviewPresentationProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* PT Identity Card */}
      <Card style={styles.identityCard}>
        <View style={styles.identityHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitial}>{ptName.charAt(0)}</Text>
            {isVerified && (
              <View style={styles.verifiedDot}>
                <ShieldCheck size={12} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.identityTextCol}>
            <View style={styles.nameRow}>
              <Text style={styles.ptName}>{ptName}</Text>
              <View style={styles.ptBadge}>
                <Text style={styles.ptBadgeText}>PT Pro</Text>
              </View>
            </View>

            <View style={styles.certRow}>
              <ShieldCheck size={14} color={colors.primary} />
              <Text style={styles.certText}>{certificateName}</Text>
            </View>

            <View style={styles.ratingRow}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{rating.toFixed(2)}</Text>
              <Text style={styles.reviewCountText}>({reviewCount}+ đánh giá)</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusToggleRow}>
          <View style={styles.statusIndicatorRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isAcceptingClients ? '#16A34A' : colors.textMuted },
              ]}
            />
            <Text style={styles.statusText}>
              Trạng thái: {isAcceptingClients ? 'Sẵn sàng nhận khách' : 'Tạm dừng nhận khách'}
            </Text>
          </View>
          <TouchableOpacity onPress={onToggleStatus} accessibilityRole="button">
            <Text style={styles.switchStatusBtnText}>Đổi trạng thái</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Operational Checklist / Tasks */}
      {pendingTasks.length > 0 && (
        <Card style={styles.tasksCard}>
          <View style={styles.tasksHeader}>
            <View style={styles.tasksTitleRow}>
              <AlertTriangle size={18} color="#D97706" />
              <Text style={styles.tasksTitle}>Nhiệm vụ cần xử lý</Text>
            </View>
            <Text style={styles.tasksCountText}>{pendingTasks.length} việc đang chờ</Text>
          </View>

          <View style={styles.tasksList}>
            {pendingTasks.map((t) => (
              <View
                key={t.id}
                style={[
                  styles.taskItem,
                  t.type === 'warning' ? styles.taskItemWarning : styles.taskItemInfo,
                ]}
              >
                <Text
                  style={[
                    styles.taskItemText,
                    t.type === 'warning' ? styles.taskTextWarning : styles.taskTextInfo,
                  ]}
                  numberOfLines={1}
                >
                  {t.title}
                </Text>
                <ChevronRight
                  size={16}
                  color={t.type === 'warning' ? '#D97706' : colors.primary}
                />
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Shortcut Hub Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Không gian quản trị PT</Text>
      </View>

      <View style={styles.shortcutsGrid}>
        <TouchableOpacity style={styles.shortcutTile} onPress={onNavigateToServices}>
          <View style={[styles.shortcutIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Briefcase size={22} color="#2563EB" />
          </View>
          <Text style={styles.shortcutLabel}>Hồ sơ &amp; Dịch vụ</Text>
          <Text style={styles.shortcutSub}>Giá &amp; gói tập</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutTile} onPress={onNavigateToSchedule}>
          <View style={[styles.shortcutIconBox, { backgroundColor: '#F0FDFA' }]}>
            <Calendar size={22} color={colors.primary} />
          </View>
          <Text style={styles.shortcutLabel}>Lịch rảnh</Text>
          <Text style={styles.shortcutSub}>Cài đặt khung giờ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutTile} onPress={onNavigateToCertificates}>
          <View style={[styles.shortcutIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Award size={22} color="#D97706" />
          </View>
          <Text style={styles.shortcutLabel}>Chứng chỉ</Text>
          <Text style={styles.shortcutSub}>Kiểm định chuyên môn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutTile} onPress={onNavigateToSessions}>
          <View style={[styles.shortcutIconBox, { backgroundColor: '#E6F4F1' }]}>
            <Users size={22} color={colors.primary} />
          </View>
          <Text style={styles.shortcutLabel}>Buổi dạy</Text>
          <Text style={styles.shortcutSub}>Quản lý học viên</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutTile} onPress={onNavigateToRevenue}>
          <View style={[styles.shortcutIconBox, { backgroundColor: '#DCFCE7' }]}>
            <DollarSign size={22} color="#16A34A" />
          </View>
          <Text style={styles.shortcutLabel}>Doanh thu</Text>
          <Text style={styles.shortcutSub}>Quyết toán 90% PT</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Sessions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lịch dạy sắp tới</Text>
      </View>

      {upcomingSessions.length === 0 ? (
        <Card style={styles.emptySessionsCard}>
          <Text style={styles.emptySessionsText}>Hôm nay bạn không có lịch dạy nào.</Text>
        </Card>
      ) : (
        upcomingSessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            activeOpacity={0.8}
            onPress={() => onSelectSession(session.id)}
            accessibilityRole="button"
            accessibilityLabel={`Xem buổi dạy với học viên ${session.clientName}`}
          >
            <Card style={styles.sessionCard}>
              <View style={styles.sessionHeaderRow}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientInitial}>{session.clientName.charAt(0)}</Text>
                </View>
                <View style={styles.sessionTitleCol}>
                  <Text style={styles.clientName}>{session.clientName}</Text>
                  <Text style={styles.serviceName}>{session.serviceName}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>

              <View style={styles.sessionMetaBox}>
                <View style={styles.metaLine}>
                  <Clock size={14} color={colors.primary} />
                  <Text style={styles.metaText}>{session.timeString}</Text>
                </View>
                <View style={styles.metaLine}>
                  <Text style={styles.metaTextSub} numberOfLines={1}>
                    {session.location}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  identityCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  identityTextCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ptName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ptBadge: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  ptBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  certText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewCountText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statusToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  switchStatusBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  tasksCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tasksTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tasksCountText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tasksList: {
    gap: spacing.xs,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  taskItemWarning: {
    backgroundColor: '#FEF3C7',
  },
  taskItemInfo: {
    backgroundColor: '#F0FDFA',
  },
  taskItemText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    paddingRight: spacing.sm,
  },
  taskTextWarning: {
    color: '#92400E',
  },
  taskTextInfo: {
    color: colors.primary,
  },
  sectionHeader: {
    paddingHorizontal: 2,
    paddingTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  shortcutTile: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  shortcutIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  shortcutLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  shortcutSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  emptySessionsCard: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptySessionsText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sessionCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  sessionTitleCol: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionMetaBox: {
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 2,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaTextSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
