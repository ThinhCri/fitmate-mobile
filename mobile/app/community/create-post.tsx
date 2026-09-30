import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CreatePostPresentation, CreatePostFormValues } from '@/features/community';

export default function CreatePostScreen() {
  const params = useLocalSearchParams<{ id?: string; content?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CreatePostFormValues) => {
    setIsSubmitting(true);
    // Client-side simulation of post creation
    setTimeout(() => {
      setIsSubmitting(false);
      router.back();
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CreatePostPresentation
        isEditing={Boolean(params.id)}
        initialValues={{
          content: params.content || '',
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
