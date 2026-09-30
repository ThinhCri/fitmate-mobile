import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  SupportTicketsPresentation,
  SupportTicketSummaryViewModel,
} from '@/features/support';

export default function SupportTicketsScreen() {
  const [tickets] = useState<SupportTicketSummaryViewModel[]>([
    {
      id: 'tk-1',
      ticketCode: '#TK-8291',
      subject: 'Yêu cầu đối soát hoàn tiền lịch hẹn ngày 28/09 do PT có việc đột xuất',
      category: 'booking_dispute',
      categoryLabel: 'Tranh chấp lịch hẹn',
      status: 'open',
      statusLabel: 'Chờ phản hồi',
      lastUpdatedAt: 'Hôm nay 10:20',
      createdAt: '28/09/2026',
    },
    {
      id: 'tk-2',
      ticketCode: '#TK-7840',
      subject: 'Lỗi đồng bộ dữ liệu nhật ký calo sau khi quét ảnh camera',
      category: 'app_bug',
      categoryLabel: 'Lỗi kỹ thuật',
      status: 'resolved',
      statusLabel: 'Đã giải quyết',
      lastUpdatedAt: '24/09/2026',
      createdAt: '23/09/2026',
    },
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SupportTicketsPresentation
        tickets={tickets}
        onBack={() => router.back()}
        onSelectTicket={(ticketId) => router.push(`/support/${ticketId}` as any)}
        onCreateTicketPress={() => router.push('/support/create' as any)}
      />
    </SafeAreaView>
  );
}
