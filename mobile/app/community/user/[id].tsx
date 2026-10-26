import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { PublicProfilePresentation, ReportBlockModal, UserPublicProfileViewModel, ReportRequest } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { authService } from '@/services/api/authService';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const [profile, setProfile] = useState<UserPublicProfileViewModel | null>(null); const [requestId, setRequestId] = useState<string>(); const [self, setSelf] = useState(false); const [error, setError] = useState(''); const [modal, setModal] = useState(false);
  const generation = useRef(0);
  const paging = useRef(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');
  const load = useCallback(async () => {
    if (!id) return;
    const version = ++generation.current;
    setError(''); setPostsError(''); setLoadingPosts(false); paging.current = false;
    try {
      const [result, me] = await Promise.all([getSocialRepository().getPublicProfile(id), authService.getMe()]);
      if (generation.current !== version) return;
      setProfile(result.profile); setRequestId(result.requestId); setSelf(me.id === id);
    } catch (e) {
      if (generation.current === version) { setProfile(null); setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ.'); }
    }
  }, [id]);
  useFocusEffect(useCallback(() => {
    setProfile(null); setModal(false); void load();
    return () => { generation.current++; };
  }, [load]));
  const loadMore = async () => {
    if (!profile?.postsNextCursor || paging.current) return;
    const version = generation.current; const cursor = profile.postsNextCursor;
    paging.current = true; setLoadingPosts(true); setPostsError('');
    try {
      const page = await getSocialRepository().listProfilePosts(id, cursor);
      if (generation.current !== version) return;
      if (page.nextCursor === cursor) throw new Error('Máy chủ trả trang lặp. Vui lòng mở lại hồ sơ.');
      setProfile((current) => {
        if (!current || current.id !== id) return current;
        const posts = [...current.posts, ...page.items.filter((post) => !current.posts.some((item) => item.id === post.id))];
        return { ...current, posts, postsNextCursor: page.nextCursor };
      });
    } catch (e) {
      if (generation.current === version) setPostsError(e instanceof Error ? e.message : 'Không tải được bài viết.');
    } finally {
      if (generation.current === version) { paging.current = false; setLoadingPosts(false); }
    }
  };
  if (!profile) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{error ? <><Text accessibilityRole="alert">{error}</Text><TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => void load()}><Text>Thử lại</Text></TouchableOpacity></> : <ActivityIndicator />}</SafeAreaView>;
  const act = async (action: () => Promise<void>) => { const version = generation.current; try { await action(); if (generation.current === version) await load(); } catch (e) { if (generation.current === version) Alert.alert('Không thể thực hiện', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } };
  const report = async (value: ReportRequest) => { try { await getSocialRepository().reportOrBlockUser(value); setModal(false); return true; } catch { return false; } };
  const block = async (userId: string) => { try { await getSocialRepository().blockUser(userId); setModal(false); router.back(); return true; } catch { return false; } };
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><PublicProfilePresentation profile={profile} isSelf={self} onLoadMorePosts={() => void loadMore()} loadingPosts={loadingPosts} postsError={postsError} onBack={() => router.back()} onSendFriendRequest={() => void act(() => getSocialRepository().sendFriendRequest(profile.id))} onCancelFriendRequest={() => requestId && void act(() => getSocialRepository().cancelFriendRequest(requestId))} onAcceptFriendRequest={() => requestId && void act(() => getSocialRepository().acceptFriendRequest(requestId))} onRejectFriendRequest={() => requestId && void act(() => getSocialRepository().rejectFriendRequest(requestId))} onUnfriend={() => void act(() => getSocialRepository().unfriend(profile.id))} onMessagePress={() => router.push(`/chat/${profile.id}` as never)} onViewPtProfile={(ptId) => router.push(`/booking/select-slot?ptId=${ptId}` as never)} onSelectPost={(postId) => router.push(`/community/post/${postId}` as never)} onReportPress={() => setModal(true)} onBlockPress={() => setModal(true)} /><ReportBlockModal visible={modal} targetId={profile.id} targetType="user" targetAuthorId={profile.id} targetAuthorName={profile.name} onClose={() => setModal(false)} onSubmitReport={report} onConfirmBlock={block} /></SafeAreaView>;
}
