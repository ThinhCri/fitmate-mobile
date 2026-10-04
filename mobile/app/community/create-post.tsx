import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CommunityPostViewModel, CreatePostPresentation, CreatePostFormValues } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { ImagePickerService } from '@/services/imagePicker';
import { ConfirmationModal } from '@/components/design-system';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

export default function CreatePostScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPostViewModel | null>(null);
  const [loading, setLoading] = useState(Boolean(params.id));
  const [isDirty, setIsDirty] = useState(false);
  const guard = useUnsavedChangesGuard(isDirty && !submitting, () => setIsDirty(false));

  useEffect(() => {
    if (!params.id) return;
    let active = true;
    void getSocialRepository().getPost(params.id)
      .then((post) => { if (active) setEditingPost(post); })
      .catch((cause) => { if (active) { Alert.alert('Không thể mở bài viết', cause instanceof Error ? cause.message : 'Vui lòng thử lại.', [{ text: 'Quay lại', onPress: () => router.back() }]); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  const pickImages = async (remaining: number) => ImagePickerService.pickMultipleFromLibrary(remaining, { quality: 0.8 });
  const submit = async (values: CreatePostFormValues) => { setSubmitting(true); try { if (params.id) { await getSocialRepository().updatePost(params.id, values); } else { await getSocialRepository().createPost(values); } setIsDirty(false); requestAnimationFrame(() => router.back()); } catch (e) { Alert.alert(params.id ? 'Không thể sửa bài viết' : 'Không thể đăng bài', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSubmitting(false); } };

  if (loading || (params.id && !editingPost)) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View></SafeAreaView>;
  }

  const initialValues = editingPost ? {
    content: editingPost.content,
    mediaUrl: editingPost.mediaUrl,
    mediaUrls: editingPost.mediaUrls,
    mediaStorageKeys: editingPost.mediaStorageKeys,
    category: editingPost.category,
    visibility: 'public' as const,
    isKnowledgeSharing: editingPost.isKnowledgeSharing,
    workoutTags: editingPost.workoutTags || [],
    mealTags: editingPost.mealTags || [],
  } : undefined;

  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
    <CreatePostPresentation isEditing={Boolean(params.id)} initialValues={initialValues} onSubmit={submit} onCancel={() => router.back()} isSubmitting={submitting} onPickImages={pickImages} onDirtyChange={setIsDirty} />
    <ConfirmationModal
      visible={guard.visible}
      title={params.id ? 'Bỏ các thay đổi?' : 'Thoát khi chưa đăng?'}
      message={params.id ? 'Các thay đổi của bạn chưa được lưu. Bạn có muốn thoát không?' : 'Bài viết chưa được đăng. Bạn có muốn thoát không?'}
      confirmLabel="Thoát không lưu"
      onConfirm={guard.discard}
      onCancel={guard.cancel}
    />
  </SafeAreaView>;
}
