import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AiChatInteractivePresentation, AiChatMessageViewModel } from '@/features/ai';
import { aiService } from '@/services/api/aiService';
import { systemService } from '@/services/api/systemService';
import { ImagePickerService, PickedImage } from '@/services/imagePicker';

export default function AiChatScreen() {
  const { id, prompt } = useLocalSearchParams<{ id: string; prompt?: string }>(); const [messages, setMessages] = useState<AiChatMessageViewModel[]>([]); const [loading, setLoading] = useState(true); const [processing, setProcessing] = useState(false); const [error, setError] = useState(''); const [attachments, setAttachments] = useState<PickedImage[]>([]); const sentInitial = useRef(false);
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
          await revealReply(reply, (updater) => setMessages((current) => updater(current)));
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
  const send = async (text: string) => { if (!id || processing) return; const selectedImages = attachments; setAttachments([]); const imageUris = selectedImages.map((image) => image.uri); const optimistic: AiChatMessageViewModel = { id: `pending-${Date.now()}`, sender: 'user', text, timestamp: 'Vừa xong', imageUri: imageUris[0], imageUris, isProcessing: true }; setMessages((current) => [...current, optimistic]); setProcessing(true); try { const reply = await aiService.sendMessage(id, text, selectedImages.map((image) => ({ uri: image.uri, mimeType: image.mimeType, fileName: image.fileName }))); setMessages((current) => current.map((item) => item.id === optimistic.id ? { ...item, isProcessing: false } : item)); await revealReply(reply, (updater) => setMessages((current) => updater(current))); } catch (e) { setAttachments(selectedImages); setMessages((current) => current.map((item) => item.id === optimistic.id ? { ...item, isProcessing: false, isError: true } : item)); Alert.alert('Không thể gửi tin nhắn', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setProcessing(false); } };
  const chooseAttachment = () => Alert.alert('Đính kèm ảnh', 'Chọn nguồn ảnh', [
    { text: 'Chụp ảnh', onPress: () => void ImagePickerService.pickFromCamera({ quality: 0.75 }).then((image) => image && setAttachments((current) => [...current, image].slice(0, 5))) },
    { text: 'Thư viện ảnh', onPress: () => void ImagePickerService.pickMultipleFromLibrary(5 - attachments.length, { quality: 0.75 }).then((images) => setAttachments((current) => [...current, ...images].slice(0, 5))) },
    { text: 'Hủy', style: 'cancel' },
  ]);
  if (loading || error) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>{loading ? <ActivityIndicator /> : <Text>{error}</Text>}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><AiChatInteractivePresentation conversationTitle="Tư vấn Fitmate AI" messages={messages} isProcessing={processing} attachmentUris={attachments.map((image) => image.uri)} onAttachmentPress={chooseAttachment} onRemoveAttachment={(index) => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))} onBack={() => router.back()} onSendMessage={(text) => void send(text)} onReviewSuggestion={() => router.push('/workout/ai-adjust' as never)} /></SafeAreaView>;
}

async function revealReply(
  reply: AiChatMessageViewModel,
  update: (updater: (messages: AiChatMessageViewModel[]) => AiChatMessageViewModel[]) => void
) {
  const characters = Array.from(reply.text);
  const chunkSize = Math.max(1, Math.ceil(characters.length / 180));
  update((messages) => [...messages, { ...reply, text: '', isProcessing: true }]);
  for (let end = chunkSize; end < characters.length; end += chunkSize) {
    const visible = characters.slice(0, end).join('');
    update((messages) => messages.map((item) => item.id === reply.id ? { ...item, text: visible } : item));
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
  update((messages) => messages.map((item) => item.id === reply.id ? { ...reply, isProcessing: false } : item));
}
