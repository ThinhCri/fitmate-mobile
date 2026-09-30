import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChatInboxPresentation,
  ConversationItemViewModel,
} from '@/features/chat';

export default function ChatInboxScreen() {
  const [conversations] = useState<ConversationItemViewModel[]>([
    {
      id: 'conv-1',
      participantId: 'pt-101',
      participantName: 'HLV Hoàng Nam',
      participantRole: 'pt',
      isVerified: true,
      isOnline: true,
      lastMessage: 'Chào bạn, buổi tập tối nay 18:00 nhớ khởi động kỹ khớp vai nhé!',
      lastMessageTime: '17:45',
      unreadCount: 1,
      sessionInfo: 'Lịch tập: 18:00 - 19:00',
    },
    {
      id: 'conv-2',
      participantId: 'user-102',
      participantName: 'Lê Quốc Bảo',
      participantRole: 'member',
      isOnline: false,
      lastMessage: 'Mai hẹn nhau ra công viên kéo xà lúc 6h sáng nhé.',
      lastMessageTime: 'Hôm qua',
      unreadCount: 0,
    },
    {
      id: 'conv-3',
      participantId: 'user-103',
      participantName: 'Bùi Tiến Dũng',
      participantRole: 'member',
      isOnline: false,
      lastMessage: 'Ok cảm ơn bạn nhiều nhé!',
      lastMessageTime: '14:30',
      unreadCount: 0,
      isRestricted: true,
    },
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ChatInboxPresentation
        conversations={conversations}
        onBack={() => router.back()}
        onSelectConversation={(conversationId) =>
          router.push(`/chat/${conversationId}` as any)
        }
        onFindFriendsPress={() => router.push('/community/friends' as any)}
      />
    </SafeAreaView>
  );
}
