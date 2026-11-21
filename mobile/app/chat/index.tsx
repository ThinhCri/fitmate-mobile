import { colors } from '@/theme/designTokens';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ChatInboxPresentation, ConversationItemViewModel } from '@/features/chat';
import { getSocialRepository } from '@/repositories/socialRepository';
import { realtimeService } from '@/services/realtime/realtimeService';

export default function ChatInboxScreen() {
  const [items, setItems] = useState<ConversationItemViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);


  useFocusEffect(useCallback(() => {
    let active = true;
    let refreshInFlight = false;
    const refresh = async (initial = false) => {
      if (refreshInFlight || (!initial && AppState.currentState !== 'active')) return;
      refreshInFlight = true;
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
        refreshInFlight = false;
        if (active) setLoading(false);
      }
    };
    void refresh(true);
    const unsubscribeRealtime = realtimeService.subscribe('chat.updated', () => void refresh());
    const timer = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
      unsubscribeRealtime();
    };
  }, []));

  if (loading || error) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{loading ? <ActivityIndicator /> : <Text>{error}</Text>}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ChatInboxPresentation conversations={items} onBack={() => router.back()} onSelectConversation={(id) => router.push(`/chat/${id}` as never)} onFindFriendsPress={() => router.push('/community/friends' as never)} /></SafeAreaView>;
}
