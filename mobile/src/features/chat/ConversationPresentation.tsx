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
  ShieldAlert,
  AlertCircle,
  Lock,
  Check,
  CheckCheck,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Avatar } from '@/components/design-system/Avatar';
import {
  ChatMessageViewModel,
  ConversationDetailViewModel,
} from './chatTypes';

export interface ConversationPresentationProps {
  conversation: ConversationDetailViewModel;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onRetryMessage: (messageId: string) => void;
  onParticipantPress: (participantId: string) => void;
  onReportPress: () => void;
}

export function ConversationPresentation({
  conversation,
  onBack,
  onSendMessage,
  onRetryMessage,
  onParticipantPress,
  onReportPress,
}: ConversationPresentationProps) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim() || conversation.isRestricted) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const renderMessageStatus = (msg: ChatMessageViewModel) => {
    switch (msg.status) {
      case 'sending':
        return <Clock size={12} color={colors.textMuted} />;
      case 'sent':
        return <Check size={12} color={colors.textMuted} />;
      case 'read':
        return <CheckCheck size={12} color={colors.primary} />;
      case 'failed':
        return (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => onRetryMessage(msg.id)}
            accessibilityLabel="Gửi thất bại. Chạm để thử lại"
          >
            <AlertCircle size={12} color={colors.danger} />
            <Text style={styles.retryText}>Gửi thất bại • Chạm để thử lại</Text>
          </TouchableOpacity>
        );
      default:
        return null;
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

        <TouchableOpacity
          style={styles.participantTouch}
          onPress={() => onParticipantPress(conversation.participantId)}
          accessibilityRole="button"
          accessibilityLabel={`Xem hồ sơ của ${conversation.participantName}`}
        >
          <Avatar uri={conversation.participantAvatar} name={conversation.participantName} size="sm" />
          <View style={styles.headerInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{conversation.participantName}</Text>
              {conversation.participantRole === 'pt' && (
                <View style={styles.ptBadge}>
                  <Text style={styles.ptBadgeText}>PT</Text>
                </View>
              )}
            </View>
            <Text style={styles.statusSubtitle}>Tin nhắn riêng</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onReportPress}
          style={styles.iconBtn}
          accessibilityLabel="Báo cáo cuộc trò chuyện"
          accessibilityRole="button"
        >
          <ShieldAlert size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages Scroll View */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {conversation.messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.isSelf ? styles.messageRowSelf : styles.messageRowOther,
            ]}
          >
            {!msg.isSelf && (
              <View style={styles.bubbleAvatarWrapper}>
                <Avatar name={msg.senderName} size="xs" />
              </View>
            )}

            <View
              style={[
                styles.bubbleContainer,
                msg.isSelf ? styles.bubbleSelf : styles.bubbleOther,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.isSelf ? styles.messageTextSelf : styles.messageTextOther,
                ]}
              >
                {msg.text}
              </Text>

              <View style={styles.messageFooter}>
                <Text
                  style={[
                    styles.timestampText,
                    msg.isSelf ? styles.timestampSelf : styles.timestampOther,
                  ]}
                >
                  {msg.timestamp}
                </Text>
                {msg.isSelf && renderMessageStatus(msg)}
              </View>
            </View>
          </View>
        ))}

        {/* Restricted Interaction Notice (Strict Stitch Requirement) */}
        {conversation.isRestricted && (
          <View style={styles.restrictedNoticeCard}>
            <View style={styles.restrictedIconBox}>
              <Lock size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.restrictedTextContainer}>
              <Text style={styles.restrictedTitle}>Tương tác đã bị giới hạn</Text>
              <Text style={styles.restrictedDesc}>
                Hai người hiện không còn là bạn bè hoặc cuộc trò chuyện đã bị giới hạn tương tác.
                Bạn vẫn có thể xem lại toàn bộ lịch sử tin nhắn trước đây.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Composer Area */}
      <View style={styles.composerContainer}>
        {conversation.isRestricted ? (
          <View style={styles.restrictedComposer}>
            <Lock size={16} color={colors.textMuted} />
            <Text style={styles.restrictedComposerText}>
              Không thể gửi tin nhắn đến cuộc trò chuyện này.
            </Text>
          </View>
        ) : (
          <View style={styles.activeComposerRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              accessibilityLabel="Gửi tin nhắn"
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Security footnote */}
        <View style={styles.securityFootnote}>
          <Shield size={12} color={colors.textMuted} />
          <Text style={styles.securityFootnoteText}>
            Hệ thống mã hoá bảo vệ nội dung trao đổi
          </Text>
        </View>
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
  participantTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginLeft: spacing.xs,
  },
  headerInfo: {
    gap: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ptBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 4,
    borderRadius: radius.xs,
  },
  ptBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  statusSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  messageRowSelf: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubbleAvatarWrapper: {
    marginBottom: 4,
  },
  bubbleContainer: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  bubbleSelf: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  messageTextSelf: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: colors.textPrimary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampText: {
    fontSize: 10,
  },
  timestampSelf: {
    color: 'rgba(255,255,255,0.8)',
  },
  timestampOther: {
    color: colors.textMuted,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  retryText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '600',
  },
  restrictedNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.md,
  },
  restrictedIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  restrictedTextContainer: {
    flex: 1,
    gap: 2,
  },
  restrictedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  restrictedDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  composerContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  restrictedComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  restrictedComposerText: {
    ...typography.caption,
    color: colors.textMuted,
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
  securityFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing.xs,
  },
  securityFootnoteText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
