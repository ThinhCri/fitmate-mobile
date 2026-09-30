import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertOctagon,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ExerciseItemViewModel } from './workoutTypes';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';

export type SessionPhase = 'prepare' | 'exercise' | 'rest' | 'paused';

export interface ActiveSessionPresentationProps {
  planTitle: string;
  currentExercise: ExerciseItemViewModel;
  currentSetIndex: number; // 0-based
  totalSets: number;
  currentExerciseIndex: number;
  totalExercises: number;
  nextExercise?: ExerciseItemViewModel;
  phase: SessionPhase;
  remainingSeconds: number;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onCompleteSet: (actualReps?: number) => void;
  onSkipRest: () => void;
  onTogglePause: () => void;
  onSkipExercise: () => void;
  onEndEarly: () => void;
}

export const ActiveSessionPresentation: React.FC<ActiveSessionPresentationProps> = ({
  planTitle,
  currentExercise,
  currentSetIndex,
  totalSets,
  currentExerciseIndex,
  totalExercises,
  nextExercise,
  phase,
  remainingSeconds,
  isAudioEnabled,
  onToggleAudio,
  onCompleteSet,
  onSkipRest,
  onTogglePause,
  onSkipExercise,
  onEndEarly,
}) => {
  const [actualReps, setActualReps] = useState<number>(currentExercise.repsPerSet ?? 10);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseMeta = () => {
    switch (phase) {
      case 'prepare':
        return { label: 'CHUẨN BỊ', color: colors.warning, bg: colors.warningLight };
      case 'exercise':
        return { label: 'ĐANG TẬP', color: colors.primaryDark, bg: colors.primaryLight };
      case 'rest':
        return { label: 'NGHỈ GIỮA HIỆP', color: colors.secondary, bg: colors.infoLight };
      case 'paused':
      default:
        return { label: 'TẠM DỪNG', color: colors.danger, bg: colors.dangerLight };
    }
  };

  const phaseMeta = getPhaseMeta();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onEndEarly}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Dừng buổi tập"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topTitleCol}>
          <Text style={[typography.caption, styles.planTitleText]} numberOfLines={1}>
            {planTitle}
          </Text>
          <Text style={[typography.bodyBold, styles.progressText]}>
            Bài {currentExerciseIndex + 1}/{totalExercises}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onToggleAudio}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={isAudioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {isAudioEnabled ? (
            <Volume2 size={22} color={colors.primary} />
          ) : (
            <VolumeX size={22} color={colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Focus Area */}
      <View style={styles.mainContent}>
        {/* Phase Pill */}
        <View style={[styles.phasePill, { backgroundColor: phaseMeta.bg }]}>
          <Text style={[typography.captionMedium, { color: phaseMeta.color }]}>
            {phaseMeta.label}
          </Text>
        </View>

        {/* Exercise Title and Set Info */}
        <Text style={[typography.display, styles.exerciseName]} numberOfLines={2}>
          {phase === 'rest' ? 'Thả lỏng & Hít thở' : currentExercise.name}
        </Text>

        <Text style={[typography.title3, styles.setInfoText]}>
          Hiệp {currentSetIndex + 1} / {totalSets}
        </Text>

        {/* Large Timer or Reps Display */}
        <View style={styles.timerCircle}>
          {phase === 'rest' || currentExercise.type === 'time' ? (
            <Text style={[typography.display, styles.timerNumber]}>
              {formatTimer(remainingSeconds)}
            </Text>
          ) : (
            <View style={styles.repsDisplayCol}>
              <Text style={[typography.display, styles.repsNumber]}>
                {currentExercise.repsPerSet ?? 10}
              </Text>
              <Text style={[typography.captionMedium, styles.repsUnit]}>LẦN / HIỆP</Text>
            </View>
          )}
        </View>

        {/* Instructions / Next preview */}
        {phase === 'rest' && nextExercise ? (
          <Card padding="sm" style={styles.nextPreviewCard}>
            <Text style={[typography.caption, styles.nextLabel]}>BÀI TIẾP THEO:</Text>
            <Text style={[typography.bodyBold, styles.nextName]}>{nextExercise.name}</Text>
          </Card>
        ) : (
          <Text style={[typography.caption, styles.instructionsText]}>
            {currentExercise.instructions ??
              'Giữ nhịp thở đều đặn và siết chặt cơ trọng tâm khi phát lực.'}
          </Text>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            onPress={onTogglePause}
            style={styles.subControlBtn}
            accessibilityRole="button"
            accessibilityLabel={phase === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {phase === 'paused' ? (
              <Play size={20} color={colors.primary} />
            ) : (
              <Pause size={20} color={colors.textPrimary} />
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            {phase === 'rest' ? (
              <PrimaryButton
                label="Bỏ qua nghỉ"
                onPress={onSkipRest}
                fullWidth
                leftIcon={<SkipForward size={18} color={colors.white} />}
              />
            ) : (
              <PrimaryButton
                label="Xong hiệp"
                onPress={() => onCompleteSet(actualReps)}
                fullWidth
                leftIcon={<CheckCircle2 size={18} color={colors.white} />}
              />
            )}
          </View>

          <TouchableOpacity
            onPress={onSkipExercise}
            style={styles.subControlBtn}
            accessibilityRole="button"
            accessibilityLabel="Bỏ qua bài tập"
          >
            <SkipForward size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    minHeight: 48,
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleCol: {
    alignItems: 'center',
    flex: 1,
  },
  planTitleText: {
    color: colors.textSecondary,
  },
  progressText: {
    color: colors.textPrimary,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  phasePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  exerciseName: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  setInfoText: {
    color: colors.textSecondary,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 6,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  timerNumber: {
    fontSize: 40,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  repsDisplayCol: {
    alignItems: 'center',
  },
  repsNumber: {
    fontSize: 48,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  repsUnit: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  nextPreviewCard: {
    backgroundColor: colors.surfaceSubtle,
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  nextLabel: {
    color: colors.textMuted,
  },
  nextName: {
    color: colors.textPrimary,
  },
  instructionsText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  subControlBtn: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
