import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  FindFriendsPresentation,
  FriendItemViewModel,
} from '@/features/community';

export default function FindFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const [friendsList, setFriendsList] = useState<FriendItemViewModel[]>([
    {
      id: 'user-101',
      name: 'Lê Quốc Bảo',
      role: 'member',
      isOnline: true,
      mutualFriendsCount: 4,
      relationship: 'friend',
      headline: 'Chung sở thích Calisthenics',
    },
    {
      id: 'pt-202',
      name: 'HLV Minh Tuấn',
      role: 'pt',
      isOnline: false,
      mutualFriendsCount: 8,
      relationship: 'friend',
      headline: 'HLV Dinh dưỡng & Thể hình',
    },
  ]);

  const [pendingRequests, setPendingRequests] = useState<FriendItemViewModel[]>([
    {
      id: 'user-303',
      name: 'Đặng Thu Trang',
      role: 'member',
      isOnline: true,
      mutualFriendsCount: 4,
      relationship: 'received_request',
      requestDate: '1 ngày trước',
      headline: 'Cùng tập Pilates',
    },
  ]);

  const [sentRequests, setSentRequests] = useState<FriendItemViewModel[]>([
    {
      id: 'user-404',
      name: 'Nguyễn Văn Hùng',
      role: 'member',
      isOnline: false,
      mutualFriendsCount: 2,
      relationship: 'sent_request',
      headline: 'Chạy bộ bán chuyên',
    },
  ]);

  const [allUsers] = useState<FriendItemViewModel[]>([
    {
      id: 'user-505',
      name: 'Hoàng Kim Ngân',
      role: 'member',
      mutualFriendsCount: 1,
      relationship: 'sent_request',
    },
    {
      id: 'pt-606',
      name: 'HLV Phạm Đức Anh',
      role: 'pt',
      mutualFriendsCount: 5,
      relationship: 'received_request',
    },
    {
      id: 'user-707',
      name: 'Trịnh Thảo Vy',
      role: 'member',
      mutualFriendsCount: 3,
      relationship: 'friend',
    },
  ]);

  const searchResults = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptRequest = (friendId: string) => {
    const target = pendingRequests.find((r) => r.id === friendId);
    if (target) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendId));
      setFriendsList((prev) => [
        ...prev,
        { ...target, relationship: 'friend' },
      ]);
    }
  };

  const handleRejectRequest = (friendId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendId));
  };

  const handleCancelSentRequest = (friendId: string) => {
    setSentRequests((prev) => prev.filter((r) => r.id !== friendId));
  };

  const handleSendRequest = (friendId: string) => {
    const user = allUsers.find((u) => u.id === friendId);
    if (user) {
      setSentRequests((prev) => [
        ...prev,
        { ...user, relationship: 'sent_request' },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <FindFriendsPresentation
        friendsList={friendsList}
        pendingRequests={pendingRequests}
        sentRequests={sentRequests}
        searchResults={searchResults}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={() => router.back()}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onCancelSentRequest={handleCancelSentRequest}
        onSendRequest={handleSendRequest}
        onSelectUser={(userId) =>
          router.push(`/community/user/${userId}` as any)
        }
        onMessageUser={(userId) => router.push(`/chat/${userId}` as any)}
      />
    </SafeAreaView>
  );
}
