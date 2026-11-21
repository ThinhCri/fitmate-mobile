import { colors } from '@/theme/designTokens';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { AiConversationListPresentation, AiConversationSummaryViewModel } from '@/features/ai';
import { aiService } from '@/services/api/aiService';
import { systemService } from '@/services/api/systemService';

export default function AiConversationsScreen() {
  const [items, setItems] = useState<AiConversationSummaryViewModel[]>([]); const [available, setAvailable] = useState(false); const [loading, setLoading] = useState(true);
  const load = useCallback(async (showLoading: boolean) => {
      if (showLoading) setLoading(true);
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
  }, []);
  useFocusEffect(useCallback(() => { void load(items.length === 0); }, [items.length, load]));
  const create = async (prompt?: string, title?: string) => { try { const id = await aiService.createThread(title || (prompt ? prompt.slice(0, 80) : 'Cuộc trò chuyện mới')); router.push({ pathname: '/ai/[id]' as never, params: { id, ...(prompt ? { prompt } : {}) } }); } catch (e) { Alert.alert('Không thể tạo cuộc trò chuyện', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } };
  const rename = async (id: string, title: string) => { try { await aiService.renameThread(id, title); setItems((current) => current.map((item) => item.id === id ? { ...item, title } : item)); } catch (e) { Alert.alert('Không thể đổi tên', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } };
  const remove = async (id: string) => { try { await aiService.deleteThread(id); setItems((current) => current.filter((item) => item.id !== id)); } catch (e) { Alert.alert('Không thể xóa cuộc trò chuyện', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } };
  if (loading) return <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><AiConversationListPresentation conversations={items} isAiAvailable={available} onBack={() => router.back()} onSelectConversation={(id) => router.push(`/ai/${id}` as never)} onNewConversation={(prompt, title) => void create(prompt, title)} onRenameConversation={(id, title) => void rename(id, title)} onDeleteConversation={(id) => void remove(id)} onManualWorkoutNavigation={() => router.push('/(tabs)/workout' as never)} onManualNutritionNavigation={() => router.push('/(tabs)/nutrition' as never)} /></SafeAreaView>;
}
