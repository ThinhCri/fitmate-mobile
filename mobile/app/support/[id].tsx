import { colors } from '@/theme/designTokens';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { TicketDetailPresentation, SupportTicketDetailViewModel } from '@/features/support';
import { getSupportRepository } from '@/repositories/supportRepository';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicketDetailViewModel | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const load = useCallback(async () => { if (!id) return; try { setTicket(await getSupportRepository().getTicketDetail(id)); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải yêu cầu.'); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  const reply = async (text: string) => { if (!ticket) return; setSending(true); try { const message = await getSupportRepository().replyTicket(ticket.id, text); setTicket((current) => current ? { ...current, messages: [...current.messages, message] } : current); } catch (e) { Alert.alert('Không thể gửi phản hồi', e instanceof Error ? e.message : 'Vui lòng thử lại.'); } finally { setSending(false); } };
  if (!ticket) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{error ? <Text>{error}</Text> : <ActivityIndicator />}</SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><TicketDetailPresentation ticket={ticket} isSending={sending} onBack={() => router.back()} onSendReply={reply} onViewLinkedBooking={(bookingId) => router.push(`/booking/${bookingId}` as never)} /></SafeAreaView>;
}
