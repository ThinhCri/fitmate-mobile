import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { TrainerDetailViewModel } from '@/services/api/types';
import { getTrainerRepository } from '@/repositories/trainerRepository';
import { TrainerDetailPresentation } from '@/features/trainer/TrainerDetailPresentation';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ApiError } from '@/services/api/client';
import { bookingService } from '@/services/api/bookingService';
import { useAuth } from '@/services/AuthContext';

export default function TrainerDetailModal() {
  const { id, justBooked } = useLocalSearchParams<{ id: string; justBooked?: string }>();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [trainer, setTrainer] = useState<TrainerDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeBooking, setActiveBooking] = useState<{
    appointmentId: string;
    slotStartUtc: string;
    status: string;
    mode?: 'confirm' | 'review' | 'upcoming';
  } | null>(null);
  const alertShownRef = useRef(false);

  const fetchTrainer = useCallback((trainerId: string) => {
    Promise.all([
      getTrainerRepository().getTrainer(trainerId),
      bookingService.listMyBookings().catch(() => ({ items: [] })),
    ])
      .then(([data, bookingsRes]) => {
        setTrainer(data);
        setIsNotFound(false);
        setIsError(false);

        const withPt = (bookingsRes.items || []).filter((b) => b.pt_user_id === trainerId);
        const nowMs = Date.now();
        const confirmable = withPt.find((b) => {
          if (b.status === 'AwaitingMemberConfirmation') return true;
          if (b.status !== 'Confirmed' && b.status !== 'InProgress') return false;
          const endMs = Date.parse(b.slot_start_utc) + b.duration_minutes * 60_000;
          return Number.isFinite(endMs) && nowMs >= endMs;
        });

        const hasReviewed = Boolean(
          currentUserId && (data.reviews || []).some((r) => r.reviewerId === currentUserId)
        );
        const completed = !hasReviewed
          ? withPt.find((b) => b.status === 'Completed')
          : undefined;
        const upcoming = withPt.find(
          (b) =>
            ['Confirmed', 'Pending', 'InProgress', 'Held'].includes(b.status) &&
            Date.parse(b.slot_start_utc) + b.duration_minutes * 60_000 > nowMs
        );

        const picked = confirmable
          ? { booking: confirmable, mode: 'confirm' as const }
          : completed
          ? { booking: completed, mode: 'review' as const }
          : upcoming
          ? { booking: upcoming, mode: 'upcoming' as const }
          : null;

        setActiveBooking(
          picked
            ? {
                appointmentId: picked.booking.id,
                slotStartUtc: picked.booking.slot_start_utc,
                status: picked.booking.status,
                mode: picked.mode,
              }
            : null
        );
      })
      .catch((err) => {
        if ((err instanceof ApiError && err.status === 404) || (err as any)?.status === 404) {
          setIsNotFound(true);
        } else {
          setIsError(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      fetchTrainer(id);
    }, [id, fetchTrainer])
  );

  useEffect(() => {
    if (justBooked === 'true' && !alertShownRef.current) {
      alertShownRef.current = true;
      Alert.alert(
        'Đặt lịch & Thanh toán thành công!',
        'Huấn luyện viên đã nhận được lịch hẹn của bạn và sẽ liên hệ sớm nhất để chuẩn bị buổi tập.'
      );
    }
  }, [justBooked]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <AppTopBar
        title={trainer?.name || 'Hồ sơ PT'}
        onBack={() => router.back()}
      />
      <View style={styles.content}>
        <TrainerDetailPresentation
          trainer={trainer}
          loading={loading}
          isNotFound={isNotFound}
          isError={isError}
          onRetry={() => {
            if (id) {
              setLoading(true);
              fetchTrainer(id);
            }
          }}
          bookingEnabled={Boolean(trainer?.id)}
          chatEnabled={Boolean(trainer?.id)}
          activeBooking={activeBooking}
          onViewBooking={(appId) => {
            router.push(`/booking/${appId}` as any);
          }}
          onReviewBooking={(appId) => {
            if (!id) return;
            router.push(
              `/booking/review?bookingId=${appId}&ptId=${id}&coachName=${encodeURIComponent(trainer?.name || 'Huấn luyện viên')}` as any
            );
          }}
          onBookPress={() => {
            if (id) {
              router.push(`/booking/select-slot?coachId=${id}` as any);
            }
          }}
          onChatPress={() => {
            if (id) {
              router.push(`/chat/${id}` as any);
            }
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
