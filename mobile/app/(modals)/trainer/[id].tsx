import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { trainersService } from '@/services/api/trainersService';
import { TrainerPublicDetail } from '@/services/api/types';
import { TrainerDetailPresentation } from '@/features/trainer/TrainerDetailPresentation';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { ApiError } from '@/services/api/client';

export default function TrainerDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trainer, setTrainer] = useState<TrainerPublicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchTrainer = useCallback((trainerId: string) => {
    trainersService
      .getTrainer(trainerId)
      .then((data) => {
        setTrainer(data);
        setIsNotFound(false);
        setIsError(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setIsNotFound(true);
        } else {
          setIsError(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchTrainer(id);
  }, [id, fetchTrainer]);

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
          onBack={() => router.back()}
          onBookPress={(trainerId) => {
            console.log('Book trainer:', trainerId);
          }}
          onChatPress={(trainerId) => {
            console.log('Chat with trainer:', trainerId);
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
