import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  AiConversationListPresentation,
  AiConversationSummaryViewModel,
} from '@/features/ai';

export default function AiConversationsScreen() {
  const [conversations, setConversations] = useState<AiConversationSummaryViewModel[]>([
    {
      id: 'ai-1',
      title: 'Tư vấn lượng protein cho người tập tăng cơ',
      lastMessagePreview:
        'Dựa trên cân nặng 67.8kg và cường độ tập của bạn, mức nạp khuyến nghị là...',
      lastUpdatedAt: 'Hôm nay 09:15',
      category: 'nutrition',
    },
    {
      id: 'ai-2',
      title: 'Điều chỉnh lịch tập ngực khi bị mỏi vai',
      lastMessagePreview:
        'Bạn nên hạ 10% mức tạ Bench Press và tăng bài khởi động Face Pull...',
      lastUpdatedAt: '26/09/2026',
      category: 'workout',
    },
  ]);

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const handleNewConversation = (initialPrompt?: string) => {
    const newId = `ai-${Date.now()}`;
    const query = initialPrompt ? `?prompt=${encodeURIComponent(initialPrompt)}` : '';
    router.push(`/ai/${newId}${query}` as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AiConversationListPresentation
        conversations={conversations}
        isAiAvailable={true}
        onBack={() => router.back()}
        onSelectConversation={(id) => router.push(`/ai/${id}` as any)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onManualWorkoutNavigation={() => router.push('/(tabs)/workout' as any)}
        onManualNutritionNavigation={() => router.push('/(tabs)/nutrition' as any)}
      />
    </SafeAreaView>
  );
}
