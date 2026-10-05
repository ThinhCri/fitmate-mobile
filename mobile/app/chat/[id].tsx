import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  ConversationPresentation,
  ConversationDetailViewModel,
  ChatMessageViewModel,
} from '@/features/chat';
import { ReportBlockModal, ReportRequest } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conversation, setConversation] = useState<ConversationDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);

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
          const localMessages = current?.messages.filter((message) => message.status === 'sending' || message.status === 'failed') || [];
          const serverIds = new Set(data.messages.map((message) => message.id));
          return {
            ...data,
            messages: [...data.messages, ...localMessages.filter((message) => !serverIds.has(message.id))],
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

  const handleSendMessage = async (text: string) => {
    if (!conversation) return;
    const tempMsg: ChatMessageViewModel = {
      id: `m-${Date.now()}`,
      senderId: 'my-id',
      senderName: 'Tôi',
      text,
      timestamp: 'Vừa xong',
      status: 'sending',
      isSelf: true,
    };

    setConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev
    );

    try {
      const sentMsg = await getSocialRepository().sendMessage(conversation.id, text);
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
    void handleSendMessage(message.text);
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
        onRetryMessage={handleRetryMessage}
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
