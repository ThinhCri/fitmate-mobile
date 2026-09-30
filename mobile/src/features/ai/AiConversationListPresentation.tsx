import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  Plus,
  Sparkles,
  Bot,
  PieChart,
  Activity,
  TrendingDown,
  Trash2,
  ShieldAlert,
  Dumbbell,
  Utensils,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { ModalShell } from '@/components/design-system/ModalShell';
import { AiConversationSummaryViewModel } from './aiTypes';

export interface AiConversationListPresentationProps {
  conversations: AiConversationSummaryViewModel[];
  isAiAvailable?: boolean;
  onBack: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: (initialPrompt?: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onManualWorkoutNavigation: () => void;
  onManualNutritionNavigation: () => void;
}

const QUICK_PROMPTS = [
  {
    icon: PieChart,
    label: 'Kiểm tra độ cân bằng Macro hôm nay',
    prompt: 'Hãy phân tích tỷ lệ Macro (Carb, Protein, Fat) trong các bữa ăn hôm nay của mình.',
  },
  {
    icon: Activity,
    label: 'Gợi ý bài tập giãn cơ phục hồi',
    prompt: 'Gợi ý 3 động tác giãn cơ tĩnh cho phần thân dưới sau buổi tập chân.',
  },
  {
    icon: TrendingDown,
    label: 'Phân tích tiến trình thể lực tuần này',
    prompt: 'Đánh giá khối lượng tạ và số buổi tập mình đã hoàn thành tuần này.',
  },
];

export function AiConversationListPresentation({
  conversations,
  isAiAvailable = true,
  onBack,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onManualWorkoutNavigation,
  onManualNutritionNavigation,
}: AiConversationListPresentationProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteTargetId) {
      onDeleteConversation(deleteTargetId);
      setDeleteTargetId(null);
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
        <Text style={styles.headerTitle}>Trợ lý Fitmate</Text>
        <TouchableOpacity
          onPress={() => onNewConversation()}
          style={styles.newChatBtn}
          accessibilityLabel="Tạo đoạn hội thoại mới"
          accessibilityRole="button"
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Scope and Disclaimer Notice */}
        <Card style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Bot size={20} color={colors.primary} />
            <Text style={styles.disclaimerTitle}>Phạm vi hỗ trợ</Text>
          </View>
          <Text style={styles.disclaimerText}>
            Trợ lý Fitmate cung cấp gợi ý điều chỉnh bài tập và cân bằng dinh dưỡng. Nội dung
            mang tính tham khảo thể chất, không thay thế chẩn đoán y tế chuyên sâu.
          </Text>
        </Card>

        {/* Honest Capability Gating Warning if AI Unavailable */}
        {!isAiAvailable && (
          <Card style={styles.unavailableCard}>
            <View style={styles.unavailableRow}>
              <ShieldAlert size={20} color={colors.warning} />
              <View style={styles.unavailableTextContainer}>
                <Text style={styles.unavailableTitle}>Mô hình AI đang tạm ngưng bảo trì</Text>
                <Text style={styles.unavailableSubtitle}>
                  Bạn có thể tiếp tục tạo và theo dõi kế hoạch thủ công:
                </Text>
              </View>
            </View>
            <View style={styles.manualNavRow}>
              <TouchableOpacity
                style={styles.manualNavBtn}
                onPress={onManualWorkoutNavigation}
              >
                <Dumbbell size={16} color={colors.primary} />
                <Text style={styles.manualNavText}>Kế hoạch tập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualNavBtn}
                onPress={onManualNutritionNavigation}
              >
                <Utensils size={16} color={colors.primary} />
                <Text style={styles.manualNavText}>Nhật ký dinh dưỡng</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Quick Suggestion Prompts */}
        <View style={styles.quickPromptsSection}>
          <Text style={styles.sectionTitle}>Gợi ý câu hỏi nhanh</Text>
          <View style={styles.chipsContainer}>
            {QUICK_PROMPTS.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptChip}
                  onPress={() => onNewConversation(p.prompt)}
                  accessibilityRole="button"
                >
                  <IconComp size={16} color={colors.primary} />
                  <Text style={styles.promptChipText}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Conversations List */}
        <View style={styles.conversationsSection}>
          <View style={styles.conversationsHeader}>
            <Text style={styles.sectionTitle}>Đoạn hội thoại gần đây</Text>
            <Text style={styles.countText}>{conversations.length} hội thoại</Text>
          </View>

          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có đoạn hội thoại nào.</Text>
            </View>
          ) : (
            conversations.map((c) => (
              <Card key={c.id} style={styles.conversationCard}>
                <TouchableOpacity
                  style={styles.conversationContent}
                  onPress={() => onSelectConversation(c.id)}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.titleRow}>
                      <View style={styles.sparkleIcon}>
                        <Sparkles size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.conversationTitle} numberOfLines={1}>
                        {c.title}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{c.lastUpdatedAt}</Text>
                  </View>

                  <Text style={styles.previewText} numberOfLines={2}>
                    {c.lastMessagePreview}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {c.category === 'nutrition'
                          ? 'Dinh dưỡng'
                          : c.category === 'workout'
                          ? 'Luyện tập'
                          : 'Tổng quát'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setDeleteTargetId(c.id)}
                  accessibilityLabel="Xóa đoạn hội thoại"
                  accessibilityRole="button"
                >
                  <Trash2 size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ModalShell
        visible={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Xóa đoạn hội thoại?"
      >
        <Text style={styles.modalBodyText}>
          Toàn bộ lịch sử trao đổi trong đoạn hội thoại này sẽ bị xóa khỏi thiết bị của bạn.
        </Text>
        <View style={styles.modalActionButtons}>
          <TouchableOpacity
            style={styles.modalCancelBtn}
            onPress={() => setDeleteTargetId(null)}
          >
            <Text style={styles.modalCancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalDeleteBtn}
            onPress={confirmDelete}
          >
            <Text style={styles.modalDeleteText}>Xóa vĩnh viễn</Text>
          </TouchableOpacity>
        </View>
      </ModalShell>
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
  newChatBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  disclaimerCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    gap: spacing.xs,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  unavailableCard: {
    padding: spacing.md,
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    gap: spacing.sm,
  },
  unavailableRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  unavailableTextContainer: {
    flex: 1,
    gap: 2,
  },
  unavailableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  unavailableSubtitle: {
    ...typography.caption,
    color: '#92400E',
  },
  manualNavRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: 4,
  },
  manualNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  quickPromptsSection: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chipsContainer: {
    gap: spacing.xs,
    marginTop: 4,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptChipText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  conversationsSection: {
    gap: spacing.sm,
  },
  conversationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    marginRight: spacing.sm,
  },
  sparkleIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  previewText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 30,
  },
  metaRow: {
    flexDirection: 'row',
    paddingLeft: 30,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  modalBodyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalDeleteBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radius.md,
  },
  modalDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
