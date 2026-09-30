import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  Image as ImageIcon,
  Plus,
  X,
  Dumbbell,
  Utensils,
  BookOpen,
  ShieldCheck,
  Globe,
  Users,
  Lock,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { ModalShell } from '@/components/design-system/ModalShell';
import { CreatePostFormValues } from './communityTypes';

export interface CreatePostPresentationProps {
  initialValues?: Partial<CreatePostFormValues>;
  isEditing?: boolean;
  onSubmit: (values: CreatePostFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AVAILABLE_WORKOUT_TAGS = [
  'Cardio & HI-IT',
  'Giãn cơ phục hồi',
  'Upper Body',
  'Leg Day',
  'Core & Abs',
];

const AVAILABLE_MEAL_TAGS = [
  'Dinh dưỡng sạch',
  'Bữa phụ năng lượng',
  'Giàu đạm (High Protein)',
  'Keto / Low Carb',
];

export function CreatePostPresentation({
  initialValues,
  isEditing = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CreatePostPresentationProps) {
  const [content, setContent] = useState(initialValues?.content || '');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(
    initialValues?.visibility || 'public'
  );
  const [category, setCategory] = useState<'workout_exp' | 'nutrition_qa' | 'all'>(
    initialValues?.category || 'workout_exp'
  );
  const [selectedWorkoutTags, setSelectedWorkoutTags] = useState<string[]>(
    initialValues?.workoutTags || []
  );
  const [selectedMealTags, setSelectedMealTags] = useState<string[]>(
    initialValues?.mealTags || []
  );
  const [isKnowledgeSharing, setIsKnowledgeSharing] = useState(
    initialValues?.isKnowledgeSharing || false
  );
  const [images, setImages] = useState<string[]>(
    initialValues?.mediaUrl ? [initialValues.mediaUrl] : []
  );
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isDirty = content.trim().length > 0 || images.length > 0;

  const handleBackPress = () => {
    if (isDirty && !isSubmitting) {
      setShowExitConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleToggleWorkoutTag = (tag: string) => {
    setSelectedWorkoutTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleMealTag = (tag: string) => {
    setSelectedMealTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddSampleImage = () => {
    if (images.length >= 4) {
      Alert.alert('Giới hạn', 'Bạn chỉ có thể đính kèm tối đa 4 hình ảnh.');
      return;
    }
    // Simulation / stub image uri for client testing
    const placeholder = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600';
    setImages((prev) => [...prev, placeholder]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập nội dung bài viết.');
      return;
    }

    onSubmit({
      content: content.trim(),
      mediaUrl: images[0],
      category,
      visibility,
      isKnowledgeSharing,
      workoutTags: selectedWorkoutTags,
      mealTags: selectedMealTags,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Sửa bài viết' : 'Tạo bài viết'}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          style={[styles.publishBtn, (!content.trim() || isSubmitting) && styles.publishBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Lưu thay đổi' : 'Đăng bài viết'}
        >
          <Text style={styles.publishBtnText}>{isEditing ? 'Lưu' : 'Đăng'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        {/* Audience / Visibility Selector */}
        <View style={styles.visibilityRow}>
          <Text style={styles.sectionLabel}>Đối tượng xem:</Text>
          <View style={styles.visibilityButtons}>
            <TouchableOpacity
              style={[
                styles.visibilityPill,
                visibility === 'public' && styles.visibilityPillActive,
              ]}
              onPress={() => setVisibility('public')}
            >
              <Globe
                size={14}
                color={visibility === 'public' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'public' && styles.visibilityTextActive,
                ]}
              >
                Công khai
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityPill,
                visibility === 'friends' && styles.visibilityPillActive,
              ]}
              onPress={() => setVisibility('friends')}
            >
              <Users
                size={14}
                color={visibility === 'friends' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'friends' && styles.visibilityTextActive,
                ]}
              >
                Bạn bè
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityPill,
                visibility === 'private' && styles.visibilityPillActive,
              ]}
              onPress={() => setVisibility('private')}
            >
              <Lock
                size={14}
                color={visibility === 'private' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'private' && styles.visibilityTextActive,
                ]}
              >
                Chỉ mình tôi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content TextArea */}
        <Card style={styles.composerCard}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Bạn đang tập luyện hoặc ăn uống thế nào hôm nay? Chia sẻ kinh nghiệm hoặc đặt câu hỏi cho cộng đồng..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            maxLength={2000}
            textAlignVertical="top"
          />
          <View style={styles.charCountRow}>
            <Text style={styles.charCountText}>{content.length}/2000 ký tự</Text>
          </View>
        </Card>

        {/* Media Preview & Upload */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Hình ảnh đính kèm ({images.length}/4)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaRow}>
            {images.map((imgUri, idx) => (
              <View key={idx} style={styles.imageThumbnailWrapper}>
                <Image source={{ uri: imgUri }} style={styles.thumbnailImage} />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => handleRemoveImage(idx)}
                  accessibilityLabel="Xóa ảnh"
                >
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 4 && (
              <TouchableOpacity
                style={styles.addPhotoCard}
                onPress={handleAddSampleImage}
                accessibilityRole="button"
                accessibilityLabel="Thêm ảnh"
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addPhotoText}>Thêm ảnh</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Tagging Workout */}
        <View style={styles.sectionBlock}>
          <View style={styles.tagHeaderRow}>
            <Dumbbell size={16} color={colors.primary} />
            <Text style={styles.sectionHeader}>Gắn thẻ buổi tập</Text>
          </View>
          <View style={styles.chipsContainer}>
            {AVAILABLE_WORKOUT_TAGS.map((tag) => {
              const selected = selectedWorkoutTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, selected && styles.tagChipActive]}
                  onPress={() => handleToggleWorkoutTag(tag)}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tagging Nutrition */}
        <View style={styles.sectionBlock}>
          <View style={styles.tagHeaderRow}>
            <Utensils size={16} color={colors.warning} />
            <Text style={styles.sectionHeader}>Gắn thẻ dinh dưỡng</Text>
          </View>
          <View style={styles.chipsContainer}>
            {AVAILABLE_MEAL_TAGS.map((tag) => {
              const selected = selectedMealTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, selected && styles.tagChipActiveMeal]}
                  onPress={() => handleToggleMealTag(tag)}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextActiveMeal]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Knowledge Sharing Toggle (Compliance: No fake reward) */}
        <Card style={styles.knowledgeCard}>
          <View style={styles.knowledgeRow}>
            <View style={styles.knowledgeIconWrapper}>
              <BookOpen size={20} color={colors.primary} />
            </View>
            <View style={styles.knowledgeTextWrapper}>
              <Text style={styles.knowledgeTitle}>Bài viết chia sẻ kiến thức</Text>
              <Text style={styles.knowledgeDescription}>
                Lưu vào thư viện cẩm nang thể hình cộng đồng Fitmate.
              </Text>
            </View>
            <Switch
              value={isKnowledgeSharing}
              onValueChange={setIsKnowledgeSharing}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.complianceNote}>
            • Tiêu chuẩn nội dung: Không áp dụng chính sách quy đổi điểm thưởng hoặc hoa hồng thương mại.
          </Text>
        </Card>

        {/* Safety & Moderation Notice */}
        <View style={styles.moderationBox}>
          <ShieldCheck size={18} color={colors.primary} />
          <Text style={styles.moderationText}>
            Nội dung đăng tải tuân thủ Quy tắc ứng xử và an toàn sức khỏe Fitmate.
          </Text>
        </View>
      </ScrollView>

      {/* Unsaved Exit Confirmation Modal */}
      <ModalShell
        visible={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Lưu bản nháp trước khi thoát?"
      >
        <Text style={styles.modalBodyText}>
          Bạn có nội dung chưa được xuất bản. Bạn có muốn thoát mà không lưu không?
        </Text>
        <View style={styles.modalActionButtons}>
          <SecondaryButton
            label="Thoát không lưu"
            onPress={() => {
              setShowExitConfirm(false);
              onCancel();
            }}
          />
          <PrimaryButton
            label="Tiếp tục chỉnh sửa"
            onPress={() => setShowExitConfirm(false)}
          />
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  publishBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  publishBtnDisabled: {
    backgroundColor: colors.border,
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  visibilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  visibilityPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  visibilityText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  visibilityTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  composerCard: {
    padding: spacing.sm,
  },
  textInput: {
    minHeight: 120,
    ...typography.body,
    color: colors.textPrimary,
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  charCountText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionBlock: {
    gap: spacing.xs,
  },
  sectionHeader: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  mediaRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  imageThumbnailWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.full,
    padding: 3,
  },
  addPhotoCard: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    gap: 4,
  },
  addPhotoText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  tagChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagChipActiveMeal: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  tagChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tagChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tagChipTextActiveMeal: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  knowledgeCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  knowledgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  knowledgeIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  knowledgeTextWrapper: {
    flex: 1,
  },
  knowledgeTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  knowledgeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  complianceNote: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  moderationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
  },
  moderationText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  modalBodyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalActionButtons: {
    gap: spacing.sm,
  },
});
