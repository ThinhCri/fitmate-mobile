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
  Image,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
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
  Paperclip,
  X,
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
  selectedImageUrls: string[];
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
  onRetryMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, reaction: '❤️' | '👍' | '😂' | '😮' | '😢') => void;
  onParticipantPress: (participantId: string) => void;
  onReportPress: () => void;
}

export function ConversationPresentation({
  conversation,
  onBack,
  onSendMessage,
  selectedImageUrls,
  onPickImages,
  onRemoveImage,
  onRetryMessage,
  onReactMessage,
  onParticipantPress,
  onReportPress,
}: ConversationPresentationProps) {
  const [inputText, setInputText] = useState('');
  const [reactionTargetId, setReactionTargetId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if ((!inputText.trim() && selectedImageUrls.length === 0) || conversation.isRestricted) return;
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

            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => !msg.isSelf && msg.status !== 'sending' && setReactionTargetId(msg.id)}
              delayLongPress={250}
              style={[
                styles.bubbleContainer,
                msg.isSelf ? styles.bubbleSelf : styles.bubbleOther,
              ]}
            >
              {!!msg.imageUrls?.length && (
                <View style={styles.messageImages}>
                  {msg.imageUrls.map((uri, imageIndex) => (
                    <View key={`${msg.id}-${imageIndex}`} style={styles.messageImageFrame}>
                      <ExpoImage
                        source={{ uri }}
                        style={styles.messageImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        recyclingKey={`${msg.id}-${imageIndex}`}
                        transition={0}
                        onLoad={() => setFailedImages((current) => {
                          const key = `${msg.id}-${imageIndex}`;
                          if (!current[key]) return current;
                          const next = { ...current };
                          delete next[key];
                          return next;
                        })}
                        onError={() => setFailedImages((current) => ({ ...current, [`${msg.id}-${imageIndex}`]: true }))}
                      />
                      {failedImages[`${msg.id}-${imageIndex}`] && (
                        <View style={styles.imageErrorOverlay}>
                          <AlertCircle size={18} color={colors.textMuted} />
                          <Text style={styles.imageErrorText}>Không tải được ảnh</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {!!msg.text && <Text
                style={[
                  styles.messageText,
                  msg.isSelf ? styles.messageTextSelf : styles.messageTextOther,
                ]}
              >
                {msg.text}
              </Text>}

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
              {!!msg.reactions?.length && (
                <View style={styles.reactionSummary}>
                  {msg.reactions.map((item) => (
                    <TouchableOpacity
                      key={item.reaction}
                      style={[styles.reactionChip, item.reactedByViewer && styles.reactionChipActive]}
                      onPress={() => onReactMessage(msg.id, item.reaction)}
                    >
                      <Text style={styles.reactionChipText}>{item.reaction} {item.count}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!msg.isSelf && reactionTargetId === msg.id && (
                <View style={styles.reactionPicker}>
                  {(['❤️', '👍', '😂', '😮', '😢'] as const).map((reaction) => (
                    <TouchableOpacity
                      key={reaction}
                      style={styles.reactionOption}
                      onPress={() => {
                        setReactionTargetId(null);
                        onReactMessage(msg.id, reaction);
                      }}
                      accessibilityLabel={`Thả cảm xúc ${reaction}`}
                    >
                      <Text style={styles.reactionOptionText}>{reaction}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </TouchableOpacity>
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
          <View>
            {selectedImageUrls.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedImagesRow}>
                {selectedImageUrls.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.selectedImageWrap}>
                    <Image source={{ uri }} style={styles.selectedImage} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => onRemoveImage(index)}>
                      <X size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          <View style={styles.activeComposerRow}>
            <TouchableOpacity style={styles.attachBtn} onPress={onPickImages} accessibilityLabel="Đính kèm tối đa 5 ảnh">
              <Paperclip size={20} color={colors.primary} />
            </TouchableOpacity>
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
                !inputText.trim() && selectedImageUrls.length === 0 && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() && selectedImageUrls.length === 0}
              accessibilityLabel="Gửi tin nhắn"
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
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
  messageImages: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  messageImageFrame: { width: 120, height: 120, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surfaceSubtle },
  messageImage: { width: '100%', height: '100%' },
  imageErrorOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surfaceSubtle },
  imageErrorText: { fontSize: 10, color: colors.textMuted },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  reactionSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
  reactionChip: { backgroundColor: colors.surfaceSubtle, borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  reactionChipActive: { borderWidth: 1, borderColor: colors.primary },
  reactionChipText: { fontSize: 12, color: colors.textPrimary },
  reactionPicker: { flexDirection: 'row', marginTop: 6, paddingHorizontal: 4, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.surface },
  reactionOption: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  reactionOptionText: { fontSize: 20 },
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
  attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  selectedImagesRow: { marginBottom: spacing.sm },
  selectedImageWrap: { marginRight: spacing.sm },
  selectedImage: { width: 64, height: 64, borderRadius: radius.sm },
  removeImageBtn: { position: 'absolute', right: -4, top: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
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
