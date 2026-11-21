import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Send,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Headphones,
  User,
  Calendar,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import {
  SupportTicketDetailViewModel,
  SupportMessageViewModel,
} from './supportTypes';

export interface TicketDetailPresentationProps {
  ticket: SupportTicketDetailViewModel;
  isSending?: boolean;
  onBack: () => void;
  onSendReply: (text: string) => void;
  onViewLinkedBooking?: (bookingId: string) => void;
}

export function TicketDetailPresentation({
  ticket,
  isSending = false,
  onBack,
  onSendReply,
  onViewLinkedBooking,
}: TicketDetailPresentationProps) {
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const isClosed = ticket.status === 'closed';

  const handleSend = () => {
    if (!replyText.trim() || isSending || isClosed) return;
    onSendReply(replyText.trim());
    setReplyText('');
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
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
        return (
          <View style={[styles.statusBadge, styles.statusResolved]}>
            <CheckCircle2 size={12} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.primaryDark }]}>Đã giải quyết</Text>
          </View>
        );
      case 'closed':
        return (
          <View style={[styles.statusBadge, styles.statusClosed]}>
            <Lock size={12} color={colors.textSecondary} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>Đã đóng</Text>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
        <Text style={styles.headerTitle}>{ticket.ticketCode}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Ticket Summary Header Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{ticket.categoryLabel}</Text>
            </View>
            {getStatusBadge()}
          </View>

          <Text style={styles.subjectText}>{ticket.subject}</Text>
          <Text style={styles.createdAtText}>Khởi tạo: {ticket.createdAt}</Text>

          {ticket.linkedBookingId && onViewLinkedBooking && (
            <TouchableOpacity
              style={styles.linkedRow}
              onPress={() => onViewLinkedBooking(ticket.linkedBookingId!)}
            >
              <Calendar size={14} color={colors.primary} />
              <Text style={styles.linkedText}>
                Lịch hẹn liên kết: {ticket.linkedBookingId} →
              </Text>
            </TouchableOpacity>
          )}
          {ticket.bookingResolution && (
            <View style={styles.resolutionNotice}>
              <Text style={styles.resolutionTitle}>
                {ticket.bookingResolution === 'PtNoShow'
                  ? 'Đã xác minh PT vắng mặt'
                  : ticket.bookingResolution === 'MemberNoShow'
                    ? 'Đã xác minh hội viên vắng mặt'
                    : 'Đã xác minh buổi tập diễn ra'}
              </Text>
              {ticket.bookingResolution === 'PtNoShow' && (
                <Text style={styles.resolutionBody}>Yêu cầu hoàn tiền đang chờ duyệt và chuyển khoản thủ công. Chưa có tiền được chuyển chỉ vì phiếu đã giải quyết.</Text>
              )}
              {!!ticket.bookingResolutionReason && <Text style={styles.resolutionBody}>{ticket.bookingResolutionReason}</Text>}
            </View>
          )}
        </Card>

        {/* Message Thread */}
        <View style={styles.threadSection}>
          <Text style={styles.threadSectionTitle}>Lịch sử trao đổi</Text>

          {ticket.messages.map((msg) => {
            const isSupport = msg.sender === 'support';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  isSupport ? styles.messageBubbleSupport : styles.messageBubbleUser,
                ]}
              >
                <View style={styles.messageHeader}>
                  <View style={styles.senderRow}>
                    {isSupport ? (
                      <Headphones size={14} color={colors.primary} />
                    ) : (
                      <User size={14} color={colors.textSecondary} />
                    )}
                    <Text style={styles.senderName}>{msg.senderName}</Text>
                    {isSupport && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>Hỗ trợ viên</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.messageTime}>{msg.timestamp}</Text>
                </View>

                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Composer */}
      <View style={styles.composerContainer}>
        {isClosed ? (
          <View style={styles.closedNotice}>
            <Lock size={16} color={colors.textMuted} />
            <Text style={styles.closedNoticeText}>
              Yêu cầu này đã được đóng. Nếu cần hỗ trợ thêm, vui lòng tạo yêu cầu mới.
            </Text>
          </View>
        ) : (
          <View style={styles.activeComposerRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập phản hồi bổ sung..."
              placeholderTextColor={colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!replyText.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!replyText.trim() || isSending}
              accessibilityLabel="Gửi phản hồi"
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: spacing.xl * 2,
  },
  summaryCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  statusClosed: {
    backgroundColor: colors.surfaceSubtle,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjectText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginTop: 2,
  },
  createdAtText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  linkedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  resolutionNotice: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
    marginTop: 4,
  },
  resolutionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  resolutionBody: {
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  threadSection: {
    gap: spacing.sm,
  },
  threadSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    borderWidth: 1,
  },
  messageBubbleUser: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  messageBubbleSupport: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  adminBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 4,
    borderRadius: radius.xs,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  messageTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  composerContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  closedNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  activeComposerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    maxHeight: 100,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
});
