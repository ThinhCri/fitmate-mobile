import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DollarSign, ShieldAlert, ChevronRight, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';

export interface PtRevenueBookingItemViewModel {
  bookingId: string;
  bookingCode: string;
  clientName: string;
  serviceName: string;
  completedDate: string;
  grossAmountVnd: number;
  platformFeeVnd: number;
  ptShareVnd: number;
  payoutStatus: 'pending' | 'on_hold' | 'approved' | 'paid_out';
}

export interface PtRevenuePresentationProps {
  periodLabel: string;
  grossGmvVnd: number;
  platformFee10PercentVnd: number;
  ptShare90PercentVnd: number;
  refundsAdjustedVnd: number | null;
  netPayoutVnd: number;
  completedPayoutVnd?: number;
  pendingPayoutVnd?: number;
  historyPage?: number;
  historyTotal?: number;
  historyPageSize?: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  bookings: PtRevenueBookingItemViewModel[];
  onSelectBookingPayout: (bookingId: string) => void;
  onFilterPeriod?: () => void;
  onManagePayoutAccount?: () => void;
}

export function PtRevenuePresentation({
  periodLabel,
  grossGmvVnd,
  platformFee10PercentVnd,
  ptShare90PercentVnd,
  refundsAdjustedVnd,
  netPayoutVnd,
  completedPayoutVnd,
  pendingPayoutVnd,
  historyPage = 1,
  historyTotal,
  historyPageSize = 20,
  onPreviousPage,
  onNextPage,
  bookings,
  onSelectBookingPayout,
  onFilterPeriod,
  onManagePayoutAccount,
}: PtRevenuePresentationProps) {
  const getPayoutBadge = (status: PtRevenueBookingItemViewModel['payoutStatus']) => {
    switch (status) {
      case 'paid_out':
        return { label: 'Đã chuyển tiền', bg: '#DCFCE7', text: '#16A34A' };
      case 'approved':
        return { label: 'Đã duyệt chi', bg: '#EFF6FF', text: '#2563EB' };
      case 'on_hold':
        return { label: 'Tạm giữ đối soát', bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { label: 'Chờ xác minh', bg: '#FEF3C7', text: '#D97706' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Disclaimer Notice */}
      <View style={styles.disclaimerBox}>
        <ShieldAlert size={18} color="#D97706" />
        <Text style={styles.disclaimerText}>
          Khoản chi được quản trị viên nền tảng xác minh và thực hiện đối soát thủ công sau buổi
          tập theo chu kỳ thanh toán.
        </Text>
      </View>
      {onManagePayoutAccount && (
        <TouchableOpacity style={styles.accountButton} onPress={onManagePayoutAccount} accessibilityRole="button">
          <Text style={styles.accountButtonText}>Tài khoản nhận tiền</Text><ChevronRight size={18} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Main Revenue Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroLabel}>Thu nhập đã ghi nhận ({periodLabel})</Text>
            <Text style={styles.heroValue}>{netPayoutVnd.toLocaleString('vi-VN')} ₫</Text>
          </View>
          {onFilterPeriod && (
            <TouchableOpacity
              style={styles.periodChip}
              onPress={onFilterPeriod}
              accessibilityRole="button"
            >
              <Calendar size={14} color={colors.primary} />
              <Text style={styles.periodChipText}>{periodLabel}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 10% / 90% Policy Breakdown Grid */}
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownCell}>
            <Text style={styles.cellLabel}>Tổng GMV ghi nhận</Text>
            <Text style={styles.cellValue}>{grossGmvVnd.toLocaleString('vi-VN')} ₫</Text>
          </View>

          <View style={styles.breakdownCell}>
            <Text style={styles.cellLabel}>Phí nền tảng (10%)</Text>
            <Text style={[styles.cellValue, { color: '#D97706' }]}>
              -{platformFee10PercentVnd.toLocaleString('vi-VN')} ₫
            </Text>
          </View>

          <View style={styles.breakdownCell}>
            <Text style={styles.cellLabel}>Phần chi trả PT (90%)</Text>
            <Text style={[styles.cellValue, { color: colors.primary }]}>
              {ptShare90PercentVnd.toLocaleString('vi-VN')} ₫
            </Text>
          </View>

          <View style={styles.breakdownCell}>
            <Text style={styles.cellLabel}>Điều chỉnh hoàn tiền (phần PT)</Text>
            <Text style={styles.cellValue}>
              {refundsAdjustedVnd === null ? 'Chưa có số liệu riêng' : refundsAdjustedVnd > 0 ? `-${refundsAdjustedVnd.toLocaleString('vi-VN')} ₫` : '0 ₫'}
            </Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionSub}>
        Đã chuyển khoản: {completedPayoutVnd === undefined ? 'Chưa có số liệu' : `${completedPayoutVnd.toLocaleString('vi-VN')} ₫`}
        {' · '}Chưa chi: {pendingPayoutVnd === undefined ? 'Chưa có số liệu' : `${pendingPayoutVnd.toLocaleString('vi-VN')} ₫`}
      </Text>
      {/* Payout Details List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bảng kê lịch dạy &amp; Quyết toán</Text>
        <Text style={styles.sectionSub}>Lịch sử toàn bộ thời gian · {historyTotal === undefined ? `${bookings.length} bản ghi đã tải` : `${historyTotal} bản ghi`}</Text>
      </View>

      <View style={styles.bookingsList}>
        {bookings.length === 0 && <Text style={styles.sectionSub}>Không có khoản ghi nhận trong trang này.</Text>}
        {bookings.map((item) => {
          const badge = getPayoutBadge(item.payoutStatus);
          return (
            <TouchableOpacity
              key={item.bookingId}
              activeOpacity={0.8}
              onPress={() => onSelectBookingPayout(item.bookingId)}
              accessibilityRole="button"
              accessibilityLabel={`Xem chi tiết quyết toán đơn ${item.bookingCode}`}
            >
              <Card style={styles.bookingCard}>
                <View style={styles.bookingTopRow}>
                  <View style={styles.bookingCodeCol}>
                    <Text style={styles.bookingCode}>#{item.bookingCode}</Text>
                    <Text style={styles.clientName}>{item.clientName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetailRow}>
                  <Text style={styles.serviceText}>{item.serviceName}</Text>
                  <Text style={styles.dateText}>{item.completedDate}</Text>
                </View>

                <View style={styles.bookingFinanceRow}>
                  <View style={styles.financeSplit}>
                    <Text style={styles.financeSplitLabel}>
                      GMV: {item.grossAmountVnd.toLocaleString('vi-VN')} ₫ • Phí 10%: -
                      {item.platformFeeVnd.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                  <View style={styles.ptShareCol}>
                    <Text style={styles.ptShareLabel}>Phần nhận 90%</Text>
                    <Text style={styles.ptShareValue}>
                      {item.ptShareVnd.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>
      {onPreviousPage && onNextPage && <View style={styles.pagination}>
        <TouchableOpacity accessibilityRole="button" disabled={historyPage <= 1} onPress={onPreviousPage} style={styles.pageButton}><Text style={styles.sectionSub}>Trang trước</Text></TouchableOpacity>
        <Text style={styles.sectionSub}>Trang {historyPage}</Text>
        <TouchableOpacity accessibilityRole="button" disabled={historyTotal === undefined || historyPage * historyPageSize >= historyTotal} onPress={onNextPage} style={styles.pageButton}><Text style={styles.sectionSub}>Trang sau</Text></TouchableOpacity>
      </View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageButton: { minHeight: 48, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  heroCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  heroValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  periodChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  breakdownCell: {
    width: '48%',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 2,
  },
  cellLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bookingsList: {
    gap: spacing.sm,
  },
  accountButton: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountButtonText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  bookingCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingCodeCol: {
    flex: 1,
  },
  bookingCode: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
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
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  serviceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bookingFinanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    marginTop: 2,
  },
  financeSplit: {
    flex: 1,
  },
  financeSplitLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  ptShareCol: {
    alignItems: 'flex-end',
  },
  ptShareLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  ptShareValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
});
