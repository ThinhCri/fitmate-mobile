import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ChatInboxPresentation, ConversationItemViewModel } from '@/features/chat';
import { getSocialRepository } from '@/repositories/socialRepository';

export default function ChatInboxScreen() {
  const [items, setItems] = useState<ConversationItemViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    const refresh = async (initial = false) => {
      try {
        const conversations = await getSocialRepository().listConversations();
        if (!active) return;
        setItems(conversations);
        setError('');
        hasLoadedRef.current = true;
      } catch (e) {
        if (active && initial && !hasLoadedRef.current) {
          setError(e instanceof Error ? e.message : 'Không thể tải hộp thư.');
        }
      } finally {
        if (active && initial) setLoading(false);
      }
    };
    void refresh(true);
    const timer = setInterval(() => void refresh(), 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []));

  if (loading || error) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{loading ? <ActivityIndicator /> : <Text>{error}</Text>}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><ChatInboxPresentation conversations={items} onBack={() => router.back()} onSelectConversation={(id) => router.push(`/chat/${id}` as never)} onFindFriendsPress={() => router.push('/community/friends' as never)} /></SafeAreaView>;
}
