import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { TrainerListPresentation } from '@/features/trainer/TrainerListPresentation';
import { trainersService } from '@/services/api/trainersService';
import {
  TrainerSummaryViewModel,
  mapPTPublicProfileToSummary,
} from '@/services/api/types';

const SPECIALTY_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Tăng cơ', label: 'Tăng cơ' },
  { id: 'Giảm mỡ', label: 'Giảm mỡ' },
  { id: 'Calisthenics', label: 'Calisthenics' },
  { id: 'Yoga', label: 'Yoga' },
];

/**
 * MarketplaceScreen (Production Route)
 *
 * Strictly calls GET /trainers with server-side query filters.
 * NEVER falls back to mock fixture upon API failure.
 *
 * NOTE (CONTRACT_GAP): The OpenAPI contract for GET /trainers does not expose
 * a full-text search parameter. Search query filters client-side across the
 * server-paginated items currently loaded.
 */
export default function MarketplaceScreen() {
  const [trainers, setTrainers] = useState<TrainerSummaryViewModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchTrainers = useCallback(
    async (cursor?: string, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await trainersService.listTrainers({
          specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
          cursor: cursor || undefined,
          limit: 10,
        });

        const mapped = (response.items || []).map(mapPTPublicProfileToSummary);

        if (cursor) {
          setTrainers((prev) => [...prev, ...mapped]);
        } else {
          setTrainers(mapped);
        }

        setNextCursor(response.nextCursor || null);
        setIsError(false);
      } catch {
        setIsError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [selectedSpecialty]
  );

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleEndReached = () => {
    if (!loading && !loadingMore && nextCursor) {
      fetchTrainers(nextCursor);
    }
  };

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
          router.push('/(modals)/trainer/' + id);
        }}
        loading={loading}
        loadingMore={loadingMore}
        isError={isError}
        onRetry={() => fetchTrainers()}
        onRefresh={() => fetchTrainers(undefined, true)}
        refreshing={refreshing}
        onEndReached={handleEndReached}
      />
    </ScreenContainer>
  );
}
