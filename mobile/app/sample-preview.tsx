import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { AppTopBar } from '@/components/design-system/AppTopBar';
import { MemberHomePresentation } from '@/features/dashboard/MemberHomePresentation';
import { TrainerListPresentation } from '@/features/trainer/TrainerListPresentation';
import { TrainerDetailPresentation } from '@/features/trainer/TrainerDetailPresentation';
import {
  TrainerSummaryViewModel,
  TrainerDetailViewModel,
} from '@/services/api/types';
import {
  memberHomeFixture,
  trainerListFixture,
  trainerDetailFixture,
} from '@/mocks/preview';

type ActiveScreen = 'home' | 'trainerList' | 'trainerDetail';
type ActiveState =
  | 'populated'
  | 'loading'
  | 'empty'
  | 'error'
  | 'offline'
  | 'not_found';

const SPECIALTY_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Tăng cơ', label: 'Tăng cơ' },
  { id: 'Giảm mỡ', label: 'Giảm mỡ' },
  { id: 'Calisthenics', label: 'Calisthenics' },
  { id: 'Yoga', label: 'Yoga' },
];

/**
 * SamplePreviewRoute (Wrapper)
 * Does NOT call hooks before conditional production check.
 */
export default function SamplePreviewRoute() {
  if (!__DEV__) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <DevSamplePreviewContent />;
}

/**
 * DevSamplePreviewContent (DEV-only Component)
 * Safely calls all preview hooks and renders Stitch Batch 1 interactive sandbox.
 */
function DevSamplePreviewContent() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [activeState, setActiveState] = useState<ActiveState>('populated');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const filteredTrainers: TrainerSummaryViewModel[] = trainerListFixture.filter(
    (t: TrainerSummaryViewModel) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialties.some((s: string) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesSpecialty =
        selectedSpecialty === 'all' ||
        t.specialties.includes(selectedSpecialty);
      return matchesSearch && matchesSpecialty;
    }
  );

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <AppTopBar
        title="Stitch Sandbox (DEV)"
        subtitle="Batch 1 — 3 Màn Hình Đại Diện"
        rightAction={
          <TouchableOpacity
            style={styles.liveAppButton}
            onPress={() => router.push('/(tabs)/dashboard')}
            accessibilityRole="button"
          >
            <Text style={styles.liveAppText}>Vào Live App</Text>
          </TouchableOpacity>
        }
      />

      {/* Screen Switcher */}
      <View style={styles.controlSection}>
        <Text style={[typography.caption, styles.controlLabel]}>MÀN HÌNH:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          <TouchableOpacity
            style={[
              styles.screenTab,
              activeScreen === 'home' && styles.screenTabActive,
            ]}
            onPress={() => setActiveScreen('home')}
          >
            <Text
              style={[
                styles.screenTabText,
                activeScreen === 'home' && styles.screenTabTextActive,
              ]}
            >
              1. Trang chủ (B01)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.screenTab,
              activeScreen === 'trainerList' && styles.screenTabActive,
            ]}
            onPress={() => setActiveScreen('trainerList')}
          >
            <Text
              style={[
                styles.screenTabText,
                activeScreen === 'trainerList' && styles.screenTabTextActive,
              ]}
            >
              2. Danh sách PT (E01)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.screenTab,
              activeScreen === 'trainerDetail' && styles.screenTabActive,
            ]}
            onPress={() => setActiveScreen('trainerDetail')}
          >
            <Text
              style={[
                styles.screenTabText,
                activeScreen === 'trainerDetail' && styles.screenTabTextActive,
              ]}
            >
              3. Hồ sơ PT (E02)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* State Switcher */}
        <Text style={[typography.caption, styles.controlLabel]}>TRẠNG THÁI UI:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {(
            [
              { id: 'populated', label: 'Populated (Có dữ liệu)' },
              { id: 'loading', label: 'Loading' },
              { id: 'empty', label: 'Empty' },
              { id: 'error', label: 'Error' },
              { id: 'offline', label: 'Offline' },
              { id: 'not_found', label: '404 (Chỉ E02)' },
            ] as const
          ).map((st) => (
            <TouchableOpacity
              key={st.id}
              style={[
                styles.stateTab,
                activeState === st.id && styles.stateTabActive,
              ]}
              onPress={() => setActiveState(st.id)}
            >
              <Text
                style={[
                  styles.stateTabText,
                  activeState === st.id && styles.stateTabTextActive,
                ]}
              >
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Presentation Content */}
      <View style={styles.previewContainer}>
        {activeScreen === 'home' ? (
          <MemberHomePresentation
            data={
              activeState === 'empty'
                ? {
                    ...memberHomeFixture,
                    todayWorkout: null,
                    todayMeals: [],
                    calories: { consumed: 0, target: 2000, burned: 0 },
                  }
                : memberHomeFixture
            }
            onFindTrainerPress={() => setActiveScreen('trainerList')}
            onWorkoutDetailPress={(_id: string) => {}}
          />
        ) : activeScreen === 'trainerList' ? (
          <TrainerListPresentation
            trainers={
              activeState === 'empty'
                ? []
                : activeState === 'populated'
                ? filteredTrainers
                : []
            }
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchClear={() => setSearchQuery('')}
            selectedSpecialty={selectedSpecialty}
            onSelectSpecialty={setSelectedSpecialty}
            specialtyOptions={SPECIALTY_OPTIONS}
            onTrainerPress={(_id: string) => {
              setActiveScreen('trainerDetail');
            }}
            loading={activeState === 'loading'}
            isError={activeState === 'error'}
            isOffline={activeState === 'offline'}
            onRetry={() => setActiveState('populated')}
          />
        ) : (
          <TrainerDetailPresentation
            trainer={
              activeState === 'empty'
                ? null
                : (trainerDetailFixture as TrainerDetailViewModel)
            }
            loading={activeState === 'loading'}
            isNotFound={activeState === 'not_found'}
            isError={activeState === 'error'}
            isOffline={activeState === 'offline'}
            onRetry={() => setActiveState('populated')}
            onBack={() => setActiveScreen('trainerList')}
            bookingEnabled={false}
            chatEnabled={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  controlSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  controlLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 6,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: 4,
  },
  screenTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  screenTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  screenTabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  screenTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  stateTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceSubtle,
    marginRight: 4,
  },
  stateTabActive: {
    backgroundColor: colors.secondaryLight,
  },
  stateTabText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  stateTabTextActive: {
    color: colors.secondary,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
  },
  liveAppButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  liveAppText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
