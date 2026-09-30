import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  TicketDetailPresentation,
  SupportTicketDetailViewModel,
} from '@/features/support';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [ticket, setTicket] = useState<SupportTicketDetailViewModel>({
    id: id || 'tk-1',
    ticketCode: '#TK-8291',
    subject: 'Yêu cầu đối soát hoàn tiền lịch hẹn ngày 28/09 do PT có việc đột xuất',
    category: 'booking_dispute',
    categoryLabel: 'Tranh chấp lịch hẹn',
    status: 'in_progress',
    statusLabel: 'Đang xử lý',
    createdAt: '28/09/2026 14:15',
    linkedBookingId: 'BOOK-9842',
    messages: [
      {
        id: 'msg-t1',
        sender: 'user',
        senderName: 'Nguyễn Minh Anh',
        text:
          'Chào ban quản trị, tôi có đặt lịch tập với HLV vào 18:00 ngày 28/09 nhưng HLV thông báo bị ốm đột xuất và hai bên đã thống nhất hủy buổi tập. Nhờ Fitmate hỗ trợ đối soát hoàn lại tiền cọc cho tôi ạ.',
        timestamp: '28/09 14:15',
      },
      {
        id: 'msg-t2',
        sender: 'support',
        senderName: 'CSKH Fitmate',
        text:
          'Chào bạn Minh Anh, Fitmate đã tiếp nhận thông tin và kiểm tra lịch hẹn #BOOK-9842. Chúng tôi đang liên hệ HLV để xác nhận biên bản hủy. Dự kiến quy trình xử lý hoàn tất trong 24 giờ làm việc.',
        timestamp: '28/09 15:00',
      },
    ],
  });

  const [isSending, setIsSending] = useState(false);

  const handleSendReply = (text: string) => {
    setIsSending(true);
    setTimeout(() => {
      setTicket((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: `msg-${Date.now()}`,
            sender: 'user',
            senderName: 'Nguyễn Minh Anh',
            text,
            timestamp: 'Vừa xong',
          },
        ],
      }));
      setIsSending(false);
    }, 400);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <TicketDetailPresentation
        ticket={ticket}
        isSending={isSending}
        onBack={() => router.back()}
        onSendReply={handleSendReply}
        onViewLinkedBooking={(bookingId) =>
          router.push(`/booking/${bookingId}` as any)
        }
      />
    </SafeAreaView>
  );
}
