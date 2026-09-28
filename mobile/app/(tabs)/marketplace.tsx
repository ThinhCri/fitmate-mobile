import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { TrainerListPresentation } from '@/features/trainer/TrainerListPresentation';
import { trainersService } from '@/services/api/trainersService';
import { TrainerPublicSummary } from '@/services/api/types';
import { trainerListFixture } from '@/mocks/preview';

const SPECIALTY_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Tăng cơ', label: 'Tăng cơ' },
  { id: 'Giảm mỡ', label: 'Giảm mỡ' },
  { id: 'Calisthenics', label: 'Calisthenics' },
  { id: 'Yoga', label: 'Yoga' },
];

export default function MarketplaceScreen() {
  const [trainers, setTrainers] = useState<TrainerPublicSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrainers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await trainersService.listTrainers({
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
      });
      setTrainers(response.items || []);
      setIsError(false);
    } catch {
      // In DEV, if backend server is not running on 10.0.2.2/localhost, display fixture
      if (__DEV__) {
        const filtered = trainerListFixture.filter((t) => {
          const matchesSpecialty =
            selectedSpecialty === 'all' ||
            t.specialties.includes(selectedSpecialty);
          return matchesSpecialty;
        });
        setTrainers(filtered);
        setIsError(false);
      } else {
        setIsError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSpecialty]);

  useEffect(() => {
    loadTrainers();
  }, [loadTrainers]);

  const displayedTrainers = trainers.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.specialties.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <ScreenContainer edges={['top']}>
      <AppTopBar title="Huấn luyện viên" hideDivider />
      <TrainerListPresentation
        trainers={displayedTrainers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery('')}
        selectedSpecialty={selectedSpecialty}
        onSelectSpecialty={setSelectedSpecialty}
        specialtyOptions={SPECIALTY_OPTIONS}
        onTrainerPress={(id) => {
          router.push(`/(modals)/trainer/${id}`);
        }}
        loading={loading}
        isError={isError}
        onRetry={() => loadTrainers()}
        onRefresh={() => loadTrainers(true)}
        refreshing={refreshing}
      />
    </ScreenContainer>
  );
}
