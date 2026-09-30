import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import {
  NotificationsPresentation,
  NotificationItemViewModel,
} from '@/features/support';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItemViewModel[]>([
    {
      id: 'notif-1',
      title: 'Xác nhận lịch tập cùng PT',
      body: 'HLV Hoàng Nam đã xác nhận lịch tập 18:00 hôm nay. Vui lòng có mặt trước 10 phút tại phòng tập.',
      timestamp: '10 phút trước',
      category: 'booking',
      isRead: false,
      targetType: 'booking',
      targetId: 'book-101',
    },
    {
      id: 'notif-2',
      title: 'Lời mời kết bạn mới',
      body: 'Đặng Thu Trang vừa gửi lời mời kết bạn kết nối tập luyện cùng bạn.',
      timestamp: '45 phút trước',
      category: 'social',
      isRead: false,
      targetType: 'friend_request',
    },
    {
      id: 'notif-3',
      title: 'Gợi ý từ Trợ lý Fitmate AI',
      body: 'Trợ lý Fitmate AI đã chuẩn bị đề xuất tối ưu hóa bài tập Upper Body A dựa trên buổi trước.',
      timestamp: '3 giờ trước',
      category: 'ai',
      isRead: true,
      targetType: 'ai_plan',
    },
    {
      id: 'notif-4',
      title: 'Khảo sát chất lượng dịch vụ',
      body: 'Sự kiện tập luyện chung tháng trước đã kết thúc và lưu trữ.',
      timestamp: '2 ngày trước',
      category: 'system',
      isRead: true,
      targetType: 'expired',
    },
  ]);

  const handleSelectNotification = (item: NotificationItemViewModel) => {
    // Mark read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    // Controlled safe navigation
    switch (item.targetType) {
      case 'booking':
        router.push(`/booking/${item.targetId || 'book-101'}` as any);
        break;
      case 'friend_request':
        router.push('/community/friends' as any);
        break;
      case 'ai_plan':
        router.push('/workout/ai-adjust' as any);
        break;
      case 'expired':
        Alert.alert(
          'Nội dung đã lưu trữ',
          'Nội dung thông báo này đã hoàn thành hoặc không còn khả dụng.',
          [{ text: 'Đóng' }]
        );
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <NotificationsPresentation
        notifications={notifications}
        onBack={() => router.back()}
        onSelectNotification={handleSelectNotification}
      />
    </SafeAreaView>
  );
}
