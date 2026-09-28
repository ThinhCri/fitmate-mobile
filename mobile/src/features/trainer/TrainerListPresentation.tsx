import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { colors, spacing, typography } from '@/theme/designTokens';
import { TrainerSummaryViewModel } from '@/services/api/types';
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
  trainers: TrainerSummaryViewModel[];
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchClear: () => void;
  selectedSpecialty: string;
  onSelectSpecialty: (specialtyId: string) => void;
  specialtyOptions: { id: string; label: string }[];
  onTrainerPress: (trainerId: string) => void;
  loading?: boolean;
  loadingMore?: boolean;
  isError?: boolean;
  isOffline?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
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
  loadingMore = false,
  isError = false,
  isOffline = false,
  onRetry,
  onRefresh,
  refreshing = false,
  onEndReached,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchFilterHeader}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={onSearchClear}
          placeholder="Lọc PT trong danh sách tải về..."
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
          description="Hãy thử chọn chuyên môn khác hoặc làm mới lại trang."
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
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[typography.caption, styles.footerLoadingText]}>
                  Đang tải thêm PT...
                </Text>
              </View>
            ) : null
          }
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
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerLoadingText: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});
