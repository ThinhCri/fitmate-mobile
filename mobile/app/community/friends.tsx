import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  FindFriendsPresentation,
  FriendItemViewModel,
} from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';

export default function FindFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState<FriendItemViewModel[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendItemViewModel[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendItemViewModel[]>([]);
  const [allUsers, setAllUsers] = useState<FriendItemViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSocialRepository()
      .getFriends()
      .then((data) => {
        setFriendsList(data.friends);
        setPendingRequests(data.pendingRequests);
        setSentRequests(data.sentRequests);
        setAllUsers([...data.friends, ...data.pendingRequests, ...data.sentRequests, ...data.discoverUsers]);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải danh sách bạn bè');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    let active = true;
    getSocialRepository().searchUsers(searchQuery).then((items) => {
      if (!active) return;
      const relationships = new Map(
        [...friendsList, ...pendingRequests, ...sentRequests].map((item) => [item.id, item])
      );
      setAllUsers(items.map((item) => relationships.has(item.id)
        ? { ...item, ...relationships.get(item.id) }
        : item));
      setError(null);
    }).catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Không thể tìm người dùng'); });
    return () => { active = false; };
  }, [friendsList, pendingRequests, searchQuery, sentRequests]);

  const searchResults = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptRequest = async (friendId: string) => {
    const target = pendingRequests.find((r) => r.id === friendId);
    if (target) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendId));
      setFriendsList((prev) => [
        ...prev,
        { ...target, relationship: 'friend' },
      ]);
      try {
        if (!target.requestId) throw new Error('Thiếu mã lời mời kết bạn.');
        await getSocialRepository().acceptFriendRequest(target.requestId);
      } catch (err) {
        setPendingRequests((prev) => [...prev, target]);
        setFriendsList((prev) => prev.filter((item) => item.id !== target.id));
        setError(err instanceof Error ? err.message : 'Không thể chấp nhận lời mời');
      }
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    const target = pendingRequests.find((item) => item.id === friendId);
    if (!target?.requestId) return;
    try {
      await getSocialRepository().rejectFriendRequest(target.requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể từ chối lời mời');
    }
  };

  const handleCancelSentRequest = async (friendId: string) => {
    const target = sentRequests.find((item) => item.id === friendId);
    if (!target?.requestId) return;
    try { await getSocialRepository().cancelFriendRequest(target.requestId); setSentRequests((prev) => prev.filter((r) => r.id !== friendId)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể hủy lời mời'); }
  };

  const handleSendRequest = async (friendId: string) => {
    const user = allUsers.find((u) => u.id === friendId);
    if (user) {
      try {
        await getSocialRepository().sendFriendRequest(friendId);
        const refreshed = await getSocialRepository().getFriends();
        setSentRequests(refreshed.sentRequests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể gửi lời mời');
      }
    }
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

  if (error && friendsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
