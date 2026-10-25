import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Flame,
  Info,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ExerciseItemViewModel } from './workoutTypes';
import { PrimaryButton } from '@/components/design-system/Buttons';
import { Card } from '@/components/design-system/Card';
import { ExerciseIllustration } from './ExerciseIllustration';
import { formatWorkoutTimer } from './sessionTiming';

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
  completedSets: number;
  plannedSets: number;
  estimatedKcal: number | null;
  isSaving: boolean;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onCompleteSet: (actualReps?: number) => void;
  onSkipRest: () => void;
  onSkipPrepare: () => void;
  onTogglePause: () => void;
  onSkipExercise: () => void;
  onEndEarly: () => void;
  onRetryMedia?: () => Promise<void>;
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
  completedSets,
  plannedSets,
  estimatedKcal,
  isSaving,
  isAudioEnabled,
  onToggleAudio,
  onCompleteSet,
  onSkipRest,
  onSkipPrepare,
  onTogglePause,
  onSkipExercise,
  onEndEarly,
  onRetryMedia,
}) => {
  const [actualReps, setActualReps] = useState<number>(currentExercise.repsPerSet ?? 10);

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

      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, Math.round(100 * completedSets / Math.max(1, plannedSets)))}%` }]} /></View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{completedSets}/{plannedSets} hiệp hoàn tất</Text>
          <View style={styles.kcalRow}><Flame size={16} color={colors.warning} /><Text style={styles.statText}>{estimatedKcal == null ? 'Chưa ước tính kcal' : `~${estimatedKcal} kcal`}</Text></View>
        </View>
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

        {currentExercise.imageStartUrl || currentExercise.imageEndUrl ? (
          <View style={styles.mediaRow}>
            {([
              { uri: currentExercise.imageStartUrl, label: 'Tư thế bắt đầu' },
              { uri: currentExercise.imageEndUrl, label: 'Tư thế kết thúc' },
            ] as const).filter((item) => Boolean(item.uri)).map((item) => (
              <View key={item.label} style={styles.mediaCell}>
                <ExerciseIllustration uri={item.uri} label={`${item.label} của ${currentExercise.name}`} onRetry={onRetryMedia} />
                <Text style={styles.mediaCaption}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noMedia}><Info size={18} color={colors.textSecondary} /><Text style={styles.statText}>Bài này chưa có ảnh minh họa</Text></View>
        )}

        {phase !== 'rest' ? (
          <Card padding="sm" style={styles.guidanceCard}>
            <Text style={styles.guidanceTitle}>Cách thực hiện</Text>
            <Text style={styles.guidanceBody}>{currentExercise.instructions?.trim() || 'Chưa có hướng dẫn chi tiết cho bài này. Chỉ tập khi bạn đã biết cách thực hiện an toàn.'}</Text>
            <Text style={styles.guidanceNote}>Ảnh chỉ để tham khảo, không thay thế hướng dẫn của huấn luyện viên.</Text>
          </Card>
        ) : null}

        {/* Large Timer or Reps Display */}
        <View style={styles.timerCircle}>
          {phase === 'prepare' || phase === 'rest' || currentExercise.type === 'time' ? (
            <Text style={[typography.display, styles.timerNumber]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {formatWorkoutTimer(remainingSeconds)}
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

        {phase === 'exercise' && currentExercise.type === 'reps' ? (
          <View style={styles.repsInputRow}>
            <Text style={styles.statText}>Bạn đã tập được bao nhiêu lần?</Text>
            <TextInput value={String(actualReps)} onChangeText={(value) => setActualReps(Math.max(0, Number(value.replace(/[^0-9]/g, '')) || 0))} keyboardType="number-pad" style={styles.repsInput} accessibilityLabel="Số lần đã tập trong hiệp" />
          </View>
        ) : null}

        {/* Next preview */}
        {phase === 'rest' && nextExercise ? (
          <Card padding="sm" style={styles.nextPreviewCard}>
            <Text style={[typography.caption, styles.nextLabel]}>BÀI TIẾP THEO:</Text>
            <Text style={[typography.bodyBold, styles.nextName]}>{nextExercise.name}</Text>
          </Card>
        ) : null}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            onPress={onTogglePause}
            disabled={isSaving}
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
            {phase === 'paused' ? (
              <PrimaryButton label="Tiếp tục" onPress={onTogglePause} disabled={isSaving} fullWidth />
            ) : phase === 'prepare' ? (
              <PrimaryButton label={`Bắt đầu bài • ${remainingSeconds}s`} onPress={onSkipPrepare} disabled={isSaving} fullWidth />
            ) : phase === 'rest' ? (
              <PrimaryButton
                label="Bỏ qua nghỉ"
                onPress={onSkipRest}
                disabled={isSaving}
                fullWidth
                leftIcon={<SkipForward size={18} color={colors.white} />}
              />
            ) : (
              <PrimaryButton
                label={isSaving ? 'Đang lưu…' : 'Xong hiệp'}
                onPress={() => onCompleteSet(actualReps)}
                loading={isSaving}
                fullWidth
                leftIcon={<CheckCircle2 size={18} color={colors.white} />}
              />
            )}
          </View>

          <TouchableOpacity
            onPress={onSkipExercise}
            disabled={isSaving || phase === 'paused'}
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
    flexGrow: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  progressTrack: { width: '100%', height: 7, borderRadius: radius.full, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  statsRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  kcalRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { ...typography.captionMedium, color: colors.textSecondary },
  mediaRow: { width: '100%', flexDirection: 'row', gap: spacing.sm },
  mediaCell: { flex: 1, minWidth: 0, gap: spacing.xs },
  mediaCaption: { ...typography.captionMedium, color: colors.textSecondary, textAlign: 'center' },
  noMedia: { width: '100%', flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg },
  guidanceCard: { width: '100%', backgroundColor: colors.surface, gap: spacing.sm },
  guidanceTitle: { ...typography.bodyBold, color: colors.textPrimary },
  guidanceBody: { ...typography.body, color: colors.textPrimary },
  guidanceNote: { ...typography.caption, color: colors.textSecondary },
  repsInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  repsInput: { minWidth: 72, minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, textAlign: 'center', color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
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
    textAlign: 'center',
    maxWidth: '90%',
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
