import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, Clock, MapPin, ChevronRight, Inbox } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { BookingAppointmentViewModel } from './bookingTypes';

export interface MyAppointmentsPresentationProps {
  appointments: BookingAppointmentViewModel[];
  onSelectAppointment: (bookingId: string) => void;
  onExploreTrainers: () => void;
  onOpenPackages: () => void;
}

export function MyAppointmentsPresentation({
  appointments,
  onSelectAppointment,
  onExploreTrainers,
  onOpenPackages,
}: MyAppointmentsPresentationProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const upcomingList = appointments.filter(
    (a) => a.bookingStatus === 'confirmed' || a.bookingStatus === 'in_progress'
  );
  const historyList = appointments.filter(
    (a) =>
      a.bookingStatus === 'completed' ||
      a.bookingStatus === 'cancelled' ||
      a.bookingStatus === 'no_show'
  );

  const displayedList = activeTab === 'upcoming' ? upcomingList : historyList;

  const getStatusBadge = (status: BookingAppointmentViewModel['bookingStatus']) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Đã xác nhận', bg: '#DCFCE7', text: '#16A34A' };
      case 'in_progress':
        return { label: 'Đang diễn ra', bg: colors.surfaceSubtle, text: colors.primary };
      case 'completed':
        return { label: 'Hoàn thành', bg: '#DCFCE7', text: '#16A34A' };
      case 'cancelled':
        return { label: 'Đã hủy', bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { label: 'Chờ duyệt', bg: '#FEF3C7', text: '#D97706' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.packagesLink} onPress={onOpenPackages} accessibilityRole="button" accessibilityLabel="Xem gói tập PT của tôi">
        <Text style={typography.bodyBold}>Gói tập PT của tôi</Text>
        <ChevronRight size={18} color={colors.primary} />
      </TouchableOpacity>
      {/* Tab Switcher */}
      <View style={styles.tabTrack}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setActiveTab('upcoming')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'upcoming' }}
          accessibilityLabel="Lịch tập sắp tới"
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Sắp tới ({upcomingList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => setActiveTab('history')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'history' }}
          accessibilityLabel="Lịch sử tập luyện"
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử ({historyList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Cards List */}
      {displayedList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Inbox size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {activeTab === 'upcoming' ? 'Không có lịch tập sắp tới' : 'Chưa có lịch sử buổi tập'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'upcoming'
              ? 'Đặt lịch cùng các Huấn luyện viên chuyên nghiệp để bắt đầu hành trình của bạn.'
              : 'Các buổi tập bạn hoàn thành hoặc đã hủy sẽ hiển thị ở đây.'}
          </Text>
          {activeTab === 'upcoming' && (
            <View style={styles.emptyAction}>
              <PrimaryButton label="Khám phá Huấn luyện viên" onPress={onExploreTrainers} />
            </View>
          )}
        </View>
      ) : (
        displayedList.map((item) => {
          const badge = getStatusBadge(item.bookingStatus);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onSelectAppointment(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Xem lịch hẹn ${item.serviceName} với ${item.coach.name}`}
            >
              <Card style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.coachAvatar}>
                    <Text style={styles.coachInitial}>{item.coach.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.coachName}>{item.coach.name}</Text>
                    <Text style={styles.serviceName}>{item.serviceName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={14} color={colors.primary} />
                    <Text style={styles.detailText}>{item.scheduledDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={14} color={colors.primary} />
                    <Text style={styles.detailText}>{item.scheduledTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color={colors.primary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.priceText}>
                    {item.paidAmountVnd.toLocaleString('vi-VN')} ₫
                  </Text>
                  <View style={styles.viewDetailRow}>
                    <Text style={styles.viewDetailText}>Chi tiết</Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
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
  packagesLink: { minHeight: 56, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 3,
    borderRadius: radius.lg,
    gap: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  emptyAction: {
    width: '100%',
    marginTop: spacing.xs,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 4,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
