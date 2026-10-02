import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChatInboxPresentation, ConversationItemViewModel } from '@/features/chat';
import { getSocialRepository } from '@/repositories/socialRepository';

export default function ChatInboxScreen() {
  const [items, setItems] = useState<ConversationItemViewModel[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { getSocialRepository().listConversations().then(setItems).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải hộp thư.')).finally(() => setLoading(false)); }, []);
  if (loading || error) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{loading ? <ActivityIndicator /> : <Text>{error}</Text>}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><ChatInboxPresentation conversations={items} onBack={() => router.back()} onSelectConversation={(id) => router.push(`/chat/${id}` as never)} onFindFriendsPress={() => router.push('/community/friends' as never)} /></SafeAreaView>;
}
