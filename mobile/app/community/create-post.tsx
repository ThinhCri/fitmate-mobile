import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CreatePostPresentation, CreatePostFormValues } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { ImagePickerService } from '@/services/imagePicker';

export default function CreatePostScreen() {
  const params = useLocalSearchParams<{ id?: string; content?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const pickImages = async (remaining: number) => ImagePickerService.pickMultipleFromLibrary(remaining, { quality: 0.8 });
  const submit = async (values: CreatePostFormValues) => { setSubmitting(true); try { if (params.id) { await getSocialRepository().updatePost(params.id, values.content); router.back(); } else { await getSocialRepository().createPost(values); router.back(); } } catch (e) { Alert.alert(params.id ? 'Không thể sửa bài viết' : 'Không thể đăng bài', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSubmitting(false); } };
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><CreatePostPresentation isEditing={Boolean(params.id)} initialValues={{ content: params.content || '' }} onSubmit={submit} onCancel={() => router.back()} isSubmitting={submitting} onPickImages={params.id ? undefined : pickImages} /></SafeAreaView>;
}
