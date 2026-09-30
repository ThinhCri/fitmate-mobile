import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ConversationPresentation,
  ConversationDetailViewModel,
  ChatMessageViewModel,
} from '@/features/chat';
import { ReportBlockModal, ReportRequest } from '@/features/community';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const isRestrictedConversation = id === 'conv-3';

  const [conversation, setConversation] = useState<ConversationDetailViewModel>({
    id: id || 'conv-1',
    participantId: 'pt-101',
    participantName: isRestrictedConversation ? 'Bùi Tiến Dũng' : 'HLV Hoàng Nam',
    participantRole: isRestrictedConversation ? 'member' : 'pt',
    isOnline: !isRestrictedConversation,
    isRestricted: isRestrictedConversation,
    messages: [
      {
        id: 'm-1',
        senderId: 'pt-101',
        senderName: isRestrictedConversation ? 'Bùi Tiến Dũng' : 'HLV Hoàng Nam',
        text: isRestrictedConversation
          ? 'Chào bạn, tuần trước tập bài lưng xong cơ lưng xô phát triển tốt lắm!'
          : 'Chào bạn, buổi tập tối nay 18:00 nhớ khởi động kỹ khớp vai nhé!',
        timestamp: '17:45',
        status: 'read',
        isSelf: false,
      },
      {
        id: 'm-2',
        senderId: 'my-id',
        senderName: 'Tôi',
        text: 'Vâng ạ, em đã sẵn sàng rồi!',
        timestamp: '17:46',
        status: 'read',
        isSelf: true,
      },
      {
        id: 'm-3',
        senderId: 'my-id',
        senderName: 'Tôi',
        text: 'Em có cần mang theo dây kháng lực không ạ?',
        timestamp: '17:47',
        status: 'sent',
        isSelf: true,
      },
    ],
  });

  const [reportModalVisible, setReportModalVisible] = useState(false);

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessageViewModel = {
      id: `m-${Date.now()}`,
      senderId: 'my-id',
      senderName: 'Tôi',
      text,
      timestamp: 'Vừa xong',
      status: 'sending',
      isSelf: true,
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    // Simulated status update to 'sent' after 400ms
    setTimeout(() => {
      setConversation((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'sent' } : m
        ),
      }));
    }, 400);
  };

  const handleRetryMessage = (messageId: string) => {
    setConversation((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === messageId ? { ...m, status: 'sent' } : m
      ),
    }));
  };

  const handleSubmitReport = (report: ReportRequest) => {
    console.log('Report submitted for conversation:', report);
  };

  const handleConfirmBlock = (userId: string) => {
    console.log('User blocked from conversation:', userId);
    setConversation((prev) => ({ ...prev, isRestricted: true }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
