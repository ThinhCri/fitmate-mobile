import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, FileText, User } from 'lucide-react-native';
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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paidAmountVnd: number;
  initialNotes?: string;
  onAcceptSession?: () => void;
  onStartSession?: () => void;
  onCompleteSession?: (notes: string) => void;
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
  initialNotes = '',
  onAcceptSession,
  onStartSession,
  onCompleteSession,
  onCancelSession,
}: PtSessionManagementPresentationProps) {
  const [sessionNotes, setSessionNotes] = useState(initialNotes);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
              : 'Chờ duyệt'}
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
        <View style={styles.infoLine}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.infoText}>{location}</Text>
        </View>
      </Card>

      {/* Post-Session Coaching Notes */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Ghi chú buổi dạy &amp; Hiệu suất học viên</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Nhập nhận xét về mức tạ, kỹ thuật và phản hồi của học viên..."
          placeholderTextColor={colors.textMuted}
          value={sessionNotes}
          onChangeText={setSessionNotes}
        />
      </Card>

      {/* Allowed Actions */}
      <View style={styles.actions}>
        {status === 'pending' && onAcceptSession && (
          <PrimaryButton label="Chấp nhận lịch hẹn" onPress={onAcceptSession} />
        )}

        {status === 'confirmed' && onStartSession && (
          <PrimaryButton label="Bắt đầu buổi tập" onPress={onStartSession} />
        )}

        {status === 'in_progress' && onCompleteSession && (
          <PrimaryButton
            label="Hoàn tất buổi tập & Lưu ghi chú"
            onPress={() => onCompleteSession(sessionNotes)}
          />
        )}

        {(status === 'pending' || status === 'confirmed') && onCancelSession && (
          <SecondaryButton
            label="Hủy lịch dạy"
            onPress={() => onCancelSession('Bận việc đột xuất')}
          />
        )}
      </View>
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
    backgroundColor: '#E6F4F1',
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
    backgroundColor: '#F8FAFC',
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
