import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AiChatInteractivePresentation, AiChatMessageViewModel } from '@/features/ai';
import { aiService } from '@/services/api/aiService';
import { systemService } from '@/services/api/systemService';

export default function AiChatScreen() {
  const { id, prompt } = useLocalSearchParams<{ id: string; prompt?: string }>(); const [messages, setMessages] = useState<AiChatMessageViewModel[]>([]); const [loading, setLoading] = useState(true); const [processing, setProcessing] = useState(false); const [error, setError] = useState(''); const sentInitial = useRef(false);
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const caps = await systemService.getCapabilities();
        if (!caps.ai.enabled || !caps.ai.companion_chat) {
          throw new Error(caps.ai.status_reason || 'Trợ lý AI hiện chưa khả dụng.');
        }
        const history = await aiService.listMessages(id);
        setMessages(history);
        if (prompt && history.length === 0 && !sentInitial.current) {
          sentInitial.current = true;
          setProcessing(true);
          const userMessage: AiChatMessageViewModel = { id: `initial-${Date.now()}`, sender: 'user', text: prompt, timestamp: 'Vừa xong' };
          setMessages([userMessage]);
          const reply = await aiService.sendMessage(id, prompt);
          setMessages([userMessage, reply]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không thể tải cuộc trò chuyện.');
      } finally {
        setProcessing(false);
        setLoading(false);
      }
    };
    void load();
  }, [id, prompt]);
  const send = async (text: string) => { if (!id || processing) return; const optimistic: AiChatMessageViewModel = { id: `pending-${Date.now()}`, sender: 'user', text, timestamp: 'Vừa xong', isProcessing: true }; setMessages((current) => [...current, optimistic]); setProcessing(true); try { const reply = await aiService.sendMessage(id, text); setMessages((current) => [...current.map((item) => item.id === optimistic.id ? { ...item, isProcessing: false } : item), reply]); } catch (e) { setMessages((current) => current.map((item) => item.id === optimistic.id ? { ...item, isProcessing: false, isError: true } : item)); Alert.alert('Không thể gửi tin nhắn', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setProcessing(false); } };
  if (loading || error) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>{loading ? <ActivityIndicator /> : <Text>{error}</Text>}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><AiChatInteractivePresentation conversationTitle="Tư vấn Fitmate AI" messages={messages} isProcessing={processing} onBack={() => router.back()} onSendMessage={(text) => void send(text)} onReviewSuggestion={() => router.push('/workout/ai-adjust' as never)} /></SafeAreaView>;
}
