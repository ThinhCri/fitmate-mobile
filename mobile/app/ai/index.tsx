import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AiConversationListPresentation, AiConversationSummaryViewModel } from '@/features/ai';
import { aiService } from '@/services/api/aiService';
import { systemService } from '@/services/api/systemService';

export default function AiConversationsScreen() {
  const [items, setItems] = useState<AiConversationSummaryViewModel[]>([]); const [available, setAvailable] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        const caps = await systemService.getCapabilities();
        const enabled = caps.ai.enabled && caps.ai.companion_chat;
        setAvailable(enabled);
        setItems(enabled ? await aiService.listThreads() : []);
      } catch {
        setAvailable(false);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);
  const create = async (prompt?: string) => { try { const id = await aiService.createThread(prompt ? prompt.slice(0, 80) : 'Cuộc trò chuyện mới'); router.push({ pathname: '/ai/[id]' as never, params: { id, ...(prompt ? { prompt } : {}) } }); } catch (e) { Alert.alert('Không thể tạo cuộc trò chuyện', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } };
  if (loading) return <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><AiConversationListPresentation conversations={items} isAiAvailable={available} onBack={() => router.back()} onSelectConversation={(id) => router.push(`/ai/${id}` as never)} onNewConversation={(prompt) => void create(prompt)} onDeleteConversation={() => Alert.alert('Chưa hỗ trợ', 'Backend chưa có API xóa cuộc trò chuyện AI.')} onManualWorkoutNavigation={() => router.push('/(tabs)/workout' as never)} onManualNutritionNavigation={() => router.push('/(tabs)/nutrition' as never)} /></SafeAreaView>;
}
