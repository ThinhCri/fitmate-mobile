import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { PublicProfilePresentation, ReportBlockModal, UserPublicProfileViewModel, ReportRequest } from '@/features/community';
import { getSocialRepository } from '@/repositories/socialRepository';
import { authService } from '@/services/api/authService';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const [profile, setProfile] = useState<UserPublicProfileViewModel | null>(null); const [requestId, setRequestId] = useState<string>(); const [self, setSelf] = useState(false); const [error, setError] = useState(''); const [modal, setModal] = useState(false);
  const load = useCallback(async () => { if (!id) return; try { const [result, me] = await Promise.all([getSocialRepository().getPublicProfile(id), authService.getMe()]); setProfile(result.profile); setRequestId(result.requestId); setSelf(me.id === id); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ.'); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (!profile) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{error ? <Text>{error}</Text> : <ActivityIndicator />}</SafeAreaView>;
  const act = async (action: () => Promise<void>) => { try { await action(); await load(); } catch (e) { Alert.alert('Không thể thực hiện', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } };
  const report = async (value: ReportRequest) => { try { await getSocialRepository().reportOrBlockUser(value); setModal(false); return true; } catch { return false; } };
  const block = async (userId: string) => { try { await getSocialRepository().blockUser(userId); setModal(false); router.back(); return true; } catch { return false; } };
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}><PublicProfilePresentation profile={profile} isSelf={self} onBack={() => router.back()} onSendFriendRequest={() => void act(() => getSocialRepository().sendFriendRequest(profile.id))} onCancelFriendRequest={() => requestId && void act(() => getSocialRepository().cancelFriendRequest(requestId))} onAcceptFriendRequest={() => requestId && void act(() => getSocialRepository().acceptFriendRequest(requestId))} onRejectFriendRequest={() => requestId && void act(() => getSocialRepository().rejectFriendRequest(requestId))} onUnfriend={() => void act(() => getSocialRepository().unfriend(profile.id))} onMessagePress={() => router.push(`/chat/${profile.id}` as never)} onViewPtProfile={(ptId) => router.push(`/booking/select-slot?ptId=${ptId}` as never)} onSelectPost={(postId) => router.push(`/community/post/${postId}` as never)} onReportPress={() => setModal(true)} onBlockPress={() => setModal(true)} /><ReportBlockModal visible={modal} targetId={profile.id} targetType="user" targetAuthorId={profile.id} targetAuthorName={profile.name} onClose={() => setModal(false)} onSubmitReport={report} onConfirmBlock={block} /></SafeAreaView>;
}
