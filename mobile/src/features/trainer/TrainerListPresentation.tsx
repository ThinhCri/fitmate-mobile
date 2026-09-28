import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { colors, spacing } from '@/theme/designTokens';
import { TrainerPublicSummary } from '@/services/api/types';
import { SearchInput } from '@/components/design-system/Inputs';
import { FilterChipGroup } from '@/components/design-system/BadgesAndChips';
import { TrainerCard } from '@/components/design-system/TrainerCard';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  OfflineState,
} from '@/components/design-system/FeedbackStates';

export interface TrainerListPresentationProps {
  trainers: TrainerPublicSummary[];
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchClear: () => void;
  selectedSpecialty: string;
  onSelectSpecialty: (specialtyId: string) => void;
  specialtyOptions: Array<{ id: string; label: string }>;
  onTrainerPress: (trainerId: string) => void;
  loading?: boolean;
  isError?: boolean;
  isOffline?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const TrainerListPresentation: React.FC<TrainerListPresentationProps> = ({
  trainers,
  searchQuery,
  onSearchChange,
  onSearchClear,
  selectedSpecialty,
  onSelectSpecialty,
  specialtyOptions,
  onTrainerPress,
  loading = false,
  isError = false,
  isOffline = false,
  onRetry,
  onRefresh,
  refreshing = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchFilterHeader}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={onSearchClear}
          placeholder="Tìm tên hoặc chuyên môn PT..."
        />

        <View style={styles.chipRow}>
          <FilterChipGroup
            items={specialtyOptions}
            selectedId={selectedSpecialty}
            onSelect={onSelectSpecialty}
          />
        </View>
      </View>

      {isOffline ? (
        <OfflineState onAction={onRetry} />
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh sách PT"
          description="Đã xảy ra lỗi khi lấy danh sách từ máy chủ. Vui lòng thử lại."
          onAction={onRetry}
        />
      ) : loading && (!trainers || trainers.length === 0) ? (
        <LoadingSkeleton count={4} />
      ) : trainers.length === 0 ? (
        <EmptyState
          title="Không tìm thấy huấn luyện viên"
          description="Hãy thử đổi từ khóa tìm kiếm hoặc chọn chuyên môn khác."
          actionLabel="Xóa bộ lọc"
          onAction={onSearchClear}
        />
      ) : (
        <FlatList
          data={trainers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrainerCard
              id={item.id}
              name={item.name}
              avatarUrl={item.avatarUrl}
              specialties={item.specialties}
              rating={item.rating}
              reviewCount={item.reviewCount}
              sessionPriceVnd={item.sessionPriceVnd}
              experienceYears={item.experienceYears}
              isVerified={item.isVerified}
              onPress={() => onTrainerPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchFilterHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chipRow: {
    marginTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 96,
  },
});
