import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { TrainerDetailViewModel } from '@/services/api/types';
import { getTrainerRepository } from '@/repositories/trainerRepository';
import { TrainerDetailPresentation } from '@/features/trainer/TrainerDetailPresentation';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ApiError } from '@/services/api/client';
import { bookingService } from '@/services/api/bookingService';

export default function TrainerDetailModal() {
  const { id, justBooked } = useLocalSearchParams<{ id: string; justBooked?: string }>();
  const [trainer, setTrainer] = useState<TrainerDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeBooking, setActiveBooking] = useState<{
    appointmentId: string;
    slotStartUtc: string;
    status: string;
  } | null>(null);
  const alertShownRef = useRef(false);

  const fetchTrainer = useCallback((trainerId: string) => {
    getTrainerRepository()
      .getTrainer(trainerId)
      .then((data) => {
        setTrainer(data);
        setIsNotFound(false);
        setIsError(false);
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

    // Check if user has an active booking with this trainer
    bookingService
      .listMyBookings()
      .then((res) => {
        const active = (res.items || []).find(
          (b) =>
            b.pt_user_id === trainerId &&
            ['Confirmed', 'Pending', 'InProgress', 'Held'].includes(b.status) &&
            new Date(b.slot_start_utc).getTime() > Date.now() - 2 * 60 * 60 * 1000
        );
        if (active) {
          setActiveBooking({
            appointmentId: active.id,
            slotStartUtc: active.slot_start_utc,
            status: active.status,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchTrainer(id);
  }, [id, fetchTrainer]);

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
