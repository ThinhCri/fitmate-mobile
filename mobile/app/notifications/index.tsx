import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import {
  NotificationsPresentation,
  NotificationItemViewModel,
} from '@/features/support';
import { getSupportRepository } from '@/repositories/supportRepository';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItemViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getSupportRepository()
      .getNotifications()
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadNotifications();
    const timer = setInterval(() => void loadNotifications(), 15000);
    return () => clearInterval(timer);
  }, [loadNotifications]));

  const handleSelectNotification = async (item: NotificationItemViewModel) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    try {
      await getSupportRepository().markNotificationRead(item.id);
    } catch {
      // Ignored
    }

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && notifications.length === 0) {
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
      <NotificationsPresentation
        notifications={notifications}
        onBack={() => router.back()}
        onSelectNotification={handleSelectNotification}
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
