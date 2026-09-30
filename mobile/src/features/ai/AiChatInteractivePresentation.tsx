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
  Sparkles,
  Bot,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import {
  AiChatMessageViewModel,
  AiStructuredSuggestionViewModel,
} from './aiTypes';

export interface AiChatInteractivePresentationProps {
  conversationTitle: string;
  messages: AiChatMessageViewModel[];
  isProcessing?: boolean;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onReviewSuggestion: (suggestion: AiStructuredSuggestionViewModel) => void;
}

export function AiChatInteractivePresentation({
  conversationTitle,
  messages,
  isProcessing = false,
  onBack,
  onSendMessage,
  onRetryMessage,
  onReviewSuggestion,
}: AiChatInteractivePresentationProps) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
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

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {conversationTitle}
          </Text>
          <View style={styles.aiBadge}>
            <Sparkles size={10} color={colors.primary} />
            <Text style={styles.aiBadgeText}>Fitmate AI Companion</Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isAssistant ? styles.messageRowAssistant : styles.messageRowUser,
              ]}
            >
              {isAssistant && (
                <View style={styles.assistantAvatar}>
                  <Bot size={16} color={colors.primary} />
                </View>
              )}

              <View
                style={[
                  styles.bubbleContainer,
                  isAssistant ? styles.bubbleAssistant : styles.bubbleUser,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isAssistant ? styles.messageTextAssistant : styles.messageTextUser,
                  ]}
                >
                  {msg.text}
                </Text>

                {/* Structured Suggestion Card (Stitch G02 Core) */}
                {msg.structuredSuggestion && (
                  <View style={styles.structuredCard}>
                    <View style={styles.structuredHeader}>
                      <SlidersHorizontal size={16} color="#FFFFFF" />
                      <Text style={styles.structuredHeaderTitle}>
                        {msg.structuredSuggestion.title}
                      </Text>
                      <View style={styles.planPill}>
                        <Text style={styles.planPillText}>
                          {msg.structuredSuggestion.targetPlanName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.structuredBody}>
                      {msg.structuredSuggestion.modifications.map((mod, idx) => (
                        <View key={idx} style={styles.modRow}>
                          <View style={styles.modTopRow}>
                            <Text style={styles.modExerciseName}>{mod.exerciseName}</Text>
                            <View style={styles.modBadge}>
                              <Text style={styles.modBadgeText}>{mod.badge}</Text>
                            </View>
                          </View>
                          <Text style={styles.modDescription}>{mod.description}</Text>
                          <View style={styles.modImpactRow}>
                            <CheckCircle2 size={12} color={colors.success} />
                            <Text style={styles.modImpactText}>{mod.impact}</Text>
                          </View>
                        </View>
                      ))}

                      {/* Safeguard Notice */}
                      <View style={styles.safeguardBox}>
                        <Shield size={14} color={colors.primary} />
                        <Text style={styles.safeguardText}>
                          Đoạn chat văn bản không tự động thay đổi nhật ký hoặc kế hoạch. Bạn toàn
                          quyền xem xét và xác nhận trước khi lưu.
                        </Text>
                      </View>

                      {/* Review CTA */}
                      <TouchableOpacity
                        style={styles.reviewBtn}
                        onPress={() => onReviewSuggestion(msg.structuredSuggestion!)}
                        accessibilityRole="button"
                        accessibilityLabel="Xem xét và áp dụng vào kế hoạch"
                      >
                        <Text style={styles.reviewBtnText}>
                          Xem xét &amp; Áp dụng vào kế hoạch
                        </Text>
                        <ArrowRight size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Text
                  style={[
                    styles.timeText,
                    isAssistant ? styles.timeAssistant : styles.timeUser,
                  ]}
                >
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={[styles.messageRow, styles.messageRowAssistant]}>
            <View style={styles.assistantAvatar}>
              <Bot size={16} color={colors.primary} />
            </View>
            <View style={[styles.bubbleContainer, styles.bubbleAssistant, styles.typingBubble]}>
              <Text style={styles.typingText}>Fitmate AI đang phân tích dữ liệu...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Composer */}
      <View style={styles.composerContainer}>
        <View style={styles.composerRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Hỏi trợ lý Fitmate về tập luyện, dinh dưỡng..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isProcessing}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isProcessing) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isProcessing}
            accessibilityLabel="Gửi câu hỏi"
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
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
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  aiBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
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
    gap: spacing.xs,
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubbleContainer: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  messageTextAssistant: {
    color: colors.textPrimary,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeAssistant: {
    color: colors.textMuted,
  },
  timeUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  structuredCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  structuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  structuredHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 6,
  },
  planPill: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  planPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  structuredBody: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  modRow: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: 4,
  },
  modTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modExerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  modBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  modDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  modImpactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  modImpactText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  safeguardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  safeguardText: {
    fontSize: 10,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 14,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  reviewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typingBubble: {
    paddingVertical: spacing.sm,
  },
  typingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  composerContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  composerRow: {
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
