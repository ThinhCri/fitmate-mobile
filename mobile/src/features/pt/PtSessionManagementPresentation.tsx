import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, MapPin, FileText } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';

export interface PtSessionManagementPresentationProps {
  sessionId: string;
  bookingCode: string;
  clientName: string;
  clientGoal?: string;
  serviceName: string;
  scheduledTime: string;
  location: string;
  status: 'held' | 'pending' | 'confirmed' | 'in_progress' | 'awaiting_member_confirmation' | 'completed' | 'cancelled' | 'disputed' | 'other';
  paidAmountVnd: number;
  busy?: boolean;
  onAcceptSession?: () => void;
  onStartSession?: () => void;
  onCompleteSession?: () => void;
  onCancelSession?: (reason: string) => void;
}

export function PtSessionManagementPresentation({
  sessionId,
  bookingCode,
  clientName,
  clientGoal,
  serviceName,
  scheduledTime,
  location,
  status,
  paidAmountVnd,
  busy = false,
  onAcceptSession,
  onStartSession,
  onCompleteSession,
  onCancelSession,
}: PtSessionManagementPresentationProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      {/* Header Context */}
      <View style={styles.headerContext}>
        <View>
          <Text style={styles.subText}>Mã đặt lịch</Text>
          <Text style={styles.bookingCode}>#{bookingCode}</Text>
        </View>

        <View
          style={[
            styles.statusTag,
            status === 'completed'
              ? styles.tagCompleted
              : status === 'in_progress'
              ? styles.tagInProgress
              : styles.tagConfirmed,
          ]}
        >
          <Text style={styles.statusTagText}>
            {status === 'completed'
              ? 'Đã hoàn thành'
              : status === 'in_progress'
              ? 'Đang diễn ra'
              : status === 'confirmed'
              ? 'Đã xác nhận'
              : status === 'awaiting_member_confirmation'
              ? 'Chờ hội viên xác nhận'
              : status === 'disputed'
              ? 'Đang xử lý phản hồi'
              : status === 'cancelled'
              ? 'Đã hủy'
              : status === 'held'
              ? 'Đang giữ chỗ'
              : status === 'pending'
              ? 'Chờ xác nhận'
              : 'Không còn hiệu lực'}
          </Text>
        </View>
      </View>

      {/* Client Information */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Học viên</Text>
        <View style={styles.clientRow}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientInitial}>{clientName.charAt(0)}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{clientName}</Text>
            {clientGoal && <Text style={styles.clientGoal}>Mục tiêu: {clientGoal}</Text>}
          </View>
        </View>
      </Card>

      {/* Appointment Information */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin buổi dạy</Text>
        <View style={styles.infoLine}>
          <FileText size={16} color={colors.primary} />
          <Text style={styles.infoText}>{serviceName}</Text>
        </View>
        <View style={styles.infoLine}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.infoText}>{scheduledTime}</Text>
        </View>
        {!!location && <View style={styles.infoLine}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.infoText}>{location}</Text>
        </View>}
      </Card>

      {status === 'awaiting_member_confirmation' && <Text style={styles.subText}>Bạn đã báo hoàn tất. Hội viên có thể xác nhận hoặc phản hồi về buổi tập.</Text>}
      {status === 'disputed' && <Text style={styles.subText}>Hội viên đã gửi phản hồi. Vui lòng chờ bộ phận hỗ trợ xử lý.</Text>}

      {/* Allowed Actions */}
      <View style={styles.actions}>
        {status === 'pending' && onAcceptSession && (
          <PrimaryButton label="Chấp nhận lịch hẹn" onPress={onAcceptSession} disabled={busy} />
        )}

        {status === 'confirmed' && onStartSession && (
          <PrimaryButton label="Bắt đầu buổi tập" onPress={onStartSession} disabled={busy} />
        )}

        {status === 'in_progress' && onCompleteSession && (
          <PrimaryButton
            label="Báo hoàn tất buổi tập"
            onPress={onCompleteSession}
            disabled={busy}
          />
        )}

        {(status === 'pending' || status === 'confirmed') && onCancelSession && (
          <SecondaryButton
            label="Hủy lịch dạy"
            onPress={() => onCancelSession('PT không thể thực hiện buổi tập')}
            disabled={busy}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerContext: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  subText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bookingCode: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tagConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  tagInProgress: {
    backgroundColor: colors.surfaceSubtle,
  },
  tagCompleted: {
    backgroundColor: '#EFF6FF',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clientGoal: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  infoText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  textArea: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
