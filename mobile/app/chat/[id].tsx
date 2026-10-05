import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  ConversationPresentation,
  ConversationDetailViewModel,
  ChatMessageViewModel,
  ChatImageInput,
} from '@/features/chat';
import { ReportBlockModal, ReportRequest } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { ImagePickerService } from '@/services/imagePicker';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conversation, setConversation] = useState<ConversationDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ChatImageInput[]>([]);
  const imageUrlCache = useRef(new Map<string, { urls: string[]; cachedAt: number }>());

  useFocusEffect(useCallback(() => {
    if (!id) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    const refresh = async (initial = false) => {
      try {
        const data = await getSocialRepository().getConversation(id);
        if (!active) return;
        const lastIncoming = [...data.messages].reverse().find((message) => !message.isSelf);
        if (lastIncoming) {
          void getSocialRepository().markConversationRead(data.id, lastIncoming.id).catch(() => undefined);
        }
        setConversation((current) => {
          const now = Date.now();
          const stableMessages = data.messages.map((message) => {
            if (!message.imageUrls?.length) return message;
            const cached = imageUrlCache.current.get(message.id);
            if (cached && cached.urls.length === message.imageUrls.length && now - cached.cachedAt < 10 * 60 * 1000) {
              return { ...message, imageUrls: cached.urls };
            }
            imageUrlCache.current.set(message.id, { urls: message.imageUrls, cachedAt: now });
            return message;
          });
          const localMessages = current?.messages.filter((message) => message.status === 'sending' || message.status === 'failed') || [];
          const serverIds = new Set(stableMessages.map((message) => message.id));
          return {
            ...data,
            messages: [...stableMessages, ...localMessages.filter((message) => !serverIds.has(message.id))],
          };
        });
        setError(null);
      } catch (err) {
        if (active && initial) setError(err instanceof Error ? err.message : 'Không thể tải cuộc trò chuyện');
      } finally {
        if (active && initial) setLoading(false);
      }
    };
    void refresh(true);
    const timer = setInterval(() => void refresh(), 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]));

  const handleSendMessage = async (text: string, imageOverride?: ChatImageInput[]) => {
    if (!conversation) return;
    const images = imageOverride ?? selectedImages;
    if (!text.trim() && images.length === 0) return;
    if (!imageOverride) setSelectedImages([]);
    const tempMsg: ChatMessageViewModel = {
      id: `m-${Date.now()}`,
      senderId: 'my-id',
      senderName: 'Tôi',
      text,
      imageUrls: images.map((image) => image.uri),
      timestamp: 'Vừa xong',
      status: 'sending',
      isSelf: true,
    };

    setConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev
    );

    try {
      const sentMsg = await getSocialRepository().sendMessage(conversation.id, text, images);
      if (sentMsg.imageUrls?.length) {
        imageUrlCache.current.set(sentMsg.id, { urls: sentMsg.imageUrls, cachedAt: Date.now() });
      }
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === tempMsg.id ? { ...sentMsg, status: 'sent' } : m
              ),
            }
          : prev
      );
    } catch {
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === tempMsg.id ? { ...m, status: 'failed' } : m
              ),
            }
          : prev
      );
    }
  };

  const handleRetryMessage = (messageId: string) => {
    const message = conversation?.messages.find((item) => item.id === messageId);
    if (!message) return;
    setConversation((prev) => prev ? { ...prev, messages: prev.messages.filter((item) => item.id !== messageId) } : prev);
    void handleSendMessage(message.text, (message.imageUrls || []).map((uri) => ({ uri })));
  };

  const handleReactMessage = async (messageId: string, reaction: '❤️' | '👍' | '😂' | '😮' | '😢') => {
    try {
      const reactions = await getSocialRepository().toggleMessageReaction(messageId, reaction);
      setConversation((current) => current ? {
        ...current,
        messages: current.messages.map((message) => message.id === messageId ? { ...message, reactions } : message),
      } : current);
    } catch (cause) {
      Alert.alert('Không thể thả cảm xúc', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
    }
  };

  const handlePickImages = async () => {
    const remaining = 5 - selectedImages.length;
    if (remaining <= 0) {
      Alert.alert('Đã đủ ảnh', 'Mỗi tin nhắn được gửi tối đa 5 ảnh.');
      return;
    }
    const picked = await ImagePickerService.pickMultipleFromLibrary(remaining);
    setSelectedImages((current) => [...current, ...picked].slice(0, 5));
  };

  const handleSubmitReport = async (report: ReportRequest): Promise<boolean> => {
    try {
      await getSocialRepository().reportOrBlockUser(report);
      return true;
    } catch {
      return false;
    }
  };

  const handleConfirmBlock = async (userId: string): Promise<boolean> => {
    try { await getSocialRepository().blockUser(userId); setConversation((prev) => (prev ? { ...prev, isRestricted: true } : prev)); return true; }
    catch { return false; }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Không tìm thấy cuộc trò chuyện'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ConversationPresentation
        conversation={conversation}
        onBack={() => router.back()}
        onSendMessage={handleSendMessage}
        selectedImageUrls={selectedImages.map((image) => image.uri)}
        onPickImages={handlePickImages}
        onRemoveImage={(index) => setSelectedImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
        onRetryMessage={handleRetryMessage}
        onReactMessage={handleReactMessage}
        onParticipantPress={(participantId) =>
          router.push(`/community/user/${participantId}` as any)
        }
        onReportPress={() => setReportModalVisible(true)}
      />

      <ReportBlockModal
        visible={reportModalVisible}
        targetId={conversation.id}
        targetType="user"
        targetAuthorId={conversation.participantId}
        targetAuthorName={conversation.participantName}
        targetSummary="Nội dung cuộc trò chuyện"
        onClose={() => setReportModalVisible(false)}
        onSubmitReport={handleSubmitReport}
        onConfirmBlock={handleConfirmBlock}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
  },
});
