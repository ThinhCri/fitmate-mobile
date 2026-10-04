import React, { useEffect, useRef, useState } from 'react';
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
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { CreatePostFormValues, PostImageInput } from './communityTypes';

export interface CreatePostPresentationProps {
  initialValues?: Partial<CreatePostFormValues>;
  isEditing?: boolean;
  onSubmit: (values: CreatePostFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onPickImages?: (remaining: number) => Promise<PostImageInput[]>;
  onDirtyChange?: (dirty: boolean) => void;
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
  onPickImages,
  onDirtyChange,
}: CreatePostPresentationProps) {
  const [content, setContent] = useState(initialValues?.content || '');
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
  const [images, setImages] = useState<PostImageInput[]>(() => initialValues?.mediaUrls?.length
    ? initialValues.mediaUrls.slice(0, 5).map((uri, index) => ({ uri, storageKey: initialValues.mediaStorageKeys?.[index] }))
    : initialValues?.mediaUrl ? [{ uri: initialValues.mediaUrl, storageKey: initialValues.mediaStorageKeys?.[0] }] : []);

  const initialSnapshot = useRef(JSON.stringify({
    content: initialValues?.content || '',
    category: initialValues?.category || 'workout_exp',
    workoutTags: initialValues?.workoutTags || [],
    mealTags: initialValues?.mealTags || [],
    isKnowledgeSharing: initialValues?.isKnowledgeSharing || false,
    images: images.map((image) => ({ uri: image.uri, storageKey: image.storageKey })),
  }));
  const currentSnapshot = JSON.stringify({ content, category, workoutTags: selectedWorkoutTags, mealTags: selectedMealTags, isKnowledgeSharing, images: images.map((image) => ({ uri: image.uri, storageKey: image.storageKey })) });
  const isDirty = currentSnapshot !== initialSnapshot.current;
  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

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

  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Đã đủ ảnh', 'Mỗi bài viết được đính kèm tối đa 5 ảnh.');
      return;
    }
    if (!onPickImages) return;
    const selected = await onPickImages(5 - images.length);
    if (selected.length) {
      setImages((prev) => {
        const merged = [...prev];
        selected.forEach((image) => {
          if (!merged.some((item) => item.uri === image.uri)) merged.push(image);
        });
        return merged.slice(0, 5);
      });
    }
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
      mediaUrl: images[0]?.uri,
      mediaUrls: images.map((image) => image.uri),
      mediaFiles: images,
      category,
      visibility: 'public',
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
          onPress={onCancel}
          style={styles.backButton}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Sửa bài viết' : 'Tạo bài viết'}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || !content.trim() || (isEditing && !isDirty)}
          style={[styles.publishBtn, (!content.trim() || isSubmitting || (isEditing && !isDirty)) && styles.publishBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Lưu thay đổi' : 'Đăng bài viết'}
        >
          <Text style={styles.publishBtnText}>{isEditing ? 'Lưu' : 'Đăng'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        {/* Content TextArea */}
        <Card style={styles.composerCard}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Bạn đang tập luyện hoặc ăn uống thế nào hôm nay? Chia sẻ kinh nghiệm hoặc đặt câu hỏi cho cộng đồng..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            maxLength={5000}
            textAlignVertical="top"
          />
          <View style={styles.charCountRow}>
            <Text style={styles.charCountText}>{content.length}/5000 ký tự</Text>
          </View>
        </Card>

        {/* Media Preview & Upload */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Hình ảnh đính kèm ({images.length}/5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaRow}>
            {images.map((image, idx) => (
              <View key={`${image.uri}-${idx}`} style={styles.imageThumbnailWrapper}>
                <Image source={{ uri: image.uri }} style={styles.thumbnailImage} />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => handleRemoveImage(idx)}
                  accessibilityLabel="Xóa ảnh"
                >
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoCard}
                onPress={() => void handleAddImage()}
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
});
