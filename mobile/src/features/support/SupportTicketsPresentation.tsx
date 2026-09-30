import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ChevronLeft,
  Plus,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { SupportTicketSummaryViewModel } from './supportTypes';

export interface SupportTicketsPresentationProps {
  tickets: SupportTicketSummaryViewModel[];
  onBack: () => void;
  onSelectTicket: (ticketId: string) => void;
  onCreateTicketPress: () => void;
}

export function SupportTicketsPresentation({
  tickets,
  onBack,
  onSelectTicket,
  onCreateTicketPress,
}: SupportTicketsPresentationProps) {
  const [tab, setTab] = useState<'open' | 'resolved'>('open');

  const filteredTickets = tickets.filter((t) =>
    tab === 'resolved'
      ? t.status === 'resolved' || t.status === 'closed'
      : t.status === 'open' || t.status === 'in_progress'
  );

  const getStatusBadge = (status: SupportTicketSummaryViewModel['status']) => {
    switch (status) {
      case 'open':
        return (
          <View style={[styles.statusBadge, styles.statusOpen]}>
            <Clock size={12} color="#D97706" />
            <Text style={[styles.statusText, { color: '#92400E' }]}>Chờ phản hồi</Text>
          </View>
        );
      case 'in_progress':
        return (
          <View style={[styles.statusBadge, styles.statusProgress]}>
            <AlertCircle size={12} color="#2563EB" />
            <Text style={[styles.statusText, { color: '#1D4ED8' }]}>Đang xử lý</Text>
          </View>
        );
      case 'resolved':
      case 'closed':
        return (
          <View style={[styles.statusBadge, styles.statusResolved]}>
            <CheckCircle2 size={12} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.primaryDark }]}>
              Đã giải quyết
            </Text>
          </View>
        );
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
        <Text style={styles.headerTitle}>Hỗ trợ &amp; Khiếu nại</Text>
        <TouchableOpacity
          onPress={onCreateTicketPress}
          style={styles.createBtn}
          accessibilityLabel="Tạo yêu cầu mới"
          accessibilityRole="button"
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'open' && styles.tabItemActive]}
          onPress={() => setTab('open')}
        >
          <Text style={[styles.tabLabel, tab === 'open' && styles.tabLabelActive]}>
            Đang xử lý
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, tab === 'resolved' && styles.tabItemActive]}
          onPress={() => setTab('resolved')}
        >
          <Text style={[styles.tabLabel, tab === 'resolved' && styles.tabLabelActive]}>
            Đã giải quyết
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Support Policy Card */}
        <Card style={styles.contactNoticeCard}>
          <Mail size={18} color={colors.primary} />
          <Text style={styles.contactNoticeText}>
            Kênh tiếp nhận chính thức: fitmate.support@fitmate.vn. Ban quản trị bảo mật thông
            tin tuyệt đối, không yêu cầu cung cấp mã OTP hay mật khẩu.
          </Text>
        </Card>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <HelpCircle size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có yêu cầu nào</Text>
            <Text style={styles.emptySubtitle}>
              Nếu gặp khó khăn về buổi tập, hoàn tiền hoặc tài khoản, hãy gửi yêu cầu để được hỗ
              trợ nhanh chóng.
            </Text>
            <View style={styles.emptyBtnWrapper}>
              <PrimaryButton
                label="Gửi yêu cầu hỗ trợ"
                onPress={onCreateTicketPress}
              />
            </View>
          </View>
        ) : (
          filteredTickets.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => onSelectTicket(t.id)}
              activeOpacity={0.8}
            >
              <Card style={styles.ticketCard}>
                <View style={styles.ticketTopRow}>
                  <View style={styles.codeCategoryRow}>
                    <Text style={styles.ticketCode}>{t.ticketCode}</Text>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{t.categoryLabel}</Text>
                    </View>
                  </View>
                  {getStatusBadge(t.status)}
                </View>

                <Text style={styles.ticketSubject} numberOfLines={2}>
                  {t.subject}
                </Text>

                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketDate}>Cập nhật: {t.lastUpdatedAt}</Text>
                  <View style={styles.detailLinkRow}>
                    <Text style={styles.detailLinkText}>Chi tiết</Text>
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
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  contactNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
  },
  contactNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  ticketCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ticketCode: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  categoryPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  categoryPillText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusOpen: {
    backgroundColor: '#FEF3C7',
  },
  statusProgress: {
    backgroundColor: '#EFF6FF',
  },
  statusResolved: {
    backgroundColor: colors.primaryLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: 2,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  ticketDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  detailLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
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
  emptyBtnWrapper: {
    width: '100%',
    maxWidth: 240,
    marginTop: spacing.md,
  },
});
