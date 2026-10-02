import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CreatePostPresentation, CreatePostFormValues } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';

export default function CreatePostScreen() {
  const params = useLocalSearchParams<{ id?: string; content?: string }>();
  const [submitting, setSubmitting] = useState(false);
  const pickImage = async () => { const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) { Alert.alert('Thiếu quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh để đính kèm hình.'); return undefined; } const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 }); return result.canceled ? undefined : result.assets[0]?.uri; };
  const submit = async (values: CreatePostFormValues) => { if (params.id) { Alert.alert('Chưa hỗ trợ', 'Backend chưa có API chỉnh sửa bài viết.'); return; } setSubmitting(true); try { const post = await getSocialRepository().createPost(values); router.replace(`/community/post/${post.id}` as never); } catch (e) { Alert.alert('Không thể đăng bài', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSubmitting(false); } };
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><CreatePostPresentation isEditing={Boolean(params.id)} initialValues={{ content: params.content || '' }} onSubmit={submit} onCancel={() => router.back()} isSubmitting={submitting} onPickImage={pickImage} /></SafeAreaView>;
}
