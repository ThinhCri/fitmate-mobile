import { colors } from '@/theme/designTokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, StyleSheet, Text, View } from 'react-native';

import { ActiveSessionPresentation, SessionPhase } from '@/features/workout/ActiveSessionPresentation';
import { CheckpointRestoreModal, EndEarlyModal } from '@/features/workout/SessionModals';
import {
  ActiveWorkoutResult,
  CompletedSetRecord,
  WorkoutPlanViewModel,
} from '@/features/workout/workoutTypes';
import { getWorkoutRepository } from '@/repositories/workoutRepository';
import { createUuid } from '@/utils/uuid';
import { estimateSessionKcal } from '@/features/workout/calorieEstimate';
import { findCatalogMatch } from '@/features/workout/workoutCatalog';
import { createAudioController } from '@/features/workout/audio';
import { useAuth } from '@/services/AuthContext';
import { restSecondsOrDefault, restoredCountdown } from '@/features/workout/sessionTiming';
import { exerciseInputErrors, wholeNumber } from '@/features/workout/workoutLimits';

const CHECKPOINT_KEY = 'fitmate_active_workout_v2';

interface ActiveWorkoutCheckpoint {
  planId: string;
  exerciseIndex: number;
  setIndex: number;
  phase: SessionPhase;
  resumePhase?: Exclude<SessionPhase, 'paused'>;
  remainingSeconds: number;
  startedAt: number;
  results: ActiveWorkoutResult[];
  clientId?: string;
  pendingCompletion?: CompletionPayload;
}

type CompletionPayload = Parameters<ReturnType<typeof getWorkoutRepository>['recordWorkoutCompletion']>[0];

export default function ActiveSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const checkpointKey = user?.id ? `${CHECKPOINT_KEY}:${user.id}` : null;
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const [plan, setPlan] = useState<WorkoutPlanViewModel | null>(null);
  const [error, setError] = useState('');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>('exercise');
  const resumePhase = useRef<Exclude<SessionPhase, 'paused'>>('exercise');
  const [remaining, setRemaining] = useState(0);
  const [audio, setAudio] = useState(true);
  const audioController = useRef(createAudioController());
  const [endModal, setEndModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<ActiveWorkoutResult[]>([]);
  const [restored, setRestored] = useState(false);
  const [restoreOffer, setRestoreOffer] = useState<ActiveWorkoutCheckpoint | null>(null);
  const [ready, setReady] = useState(false);
  const startedAt = useRef(Date.now());
  const clientId = useRef(createUuid());
  const pendingCompletion = useRef<CompletionPayload | null>(null);
  const [weightKg, setWeightKg] = useState(0);

  useEffect(() => {
    getWorkoutRepository().getWeightRecords()
      .then(({ currentWeightKg }) => setWeightKg(currentWeightKg))
      .catch(() => setWeightKg(0));
  }, []);

  useEffect(() => {
    if (!planId) {
      setError('Thiếu mã kế hoạch.');
      return;
    }
    if (!checkpointKey) return;
    let active = true;
    Promise.all([
      getWorkoutRepository().getPlan(planId),
      AsyncStorage.getItem(checkpointKey),
      getWorkoutRepository().listExerciseCatalog().catch(() => []),
    ])
      .then(([value, rawCheckpoint, catalog]) => {
        if (!active) return;
        if (!value.exercises.length) throw new Error('Kế hoạch chưa có bài tập.');
        if (value.exercises.some(item => Object.keys(exerciseInputErrors(item)).length > 0))
          throw new Error('Kế hoạch có số liệu vượt giới hạn: 1–10 hiệp, 1–100 lần, tập 1–600 giây và nghỉ 0–600 giây. Hãy chỉnh lại kế hoạch trước khi bắt đầu.');
        setPlan({
          ...value,
          exercises: value.exercises.map((item) => {
            const source = findCatalogMatch(item, catalog);
            return {
              ...item,
              restSeconds: restSecondsOrDefault(item.restSeconds),
              imageStartUrl: source?.imageStartUrl ?? item.imageStartUrl,
              imageEndUrl: source?.imageEndUrl ?? item.imageEndUrl,
              instructions: source?.instructionsVi.join(' ') ?? item.instructions,
              equipment: source?.equipment ?? item.equipment,
            };
          }),
        });
        if (rawCheckpoint) {
          try {
            const checkpoint = JSON.parse(rawCheckpoint) as ActiveWorkoutCheckpoint;
            if (checkpoint.planId === value.id) {
              setRestoreOffer(checkpoint);
              return;
            }
          } catch {
            // Ignore a corrupt checkpoint and begin a fresh workout.
          }
        }
        setPhase('exercise');
        setRemaining(value.exercises[0].type === 'time' ? value.exercises[0].durationSeconds ?? 30 : 0);
        setReady(true);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải kế hoạch.');
      });
    return () => {
      active = false;
    };
  }, [checkpointKey, planId]);

  const exercise = plan?.exercises[exerciseIndex];

  useEffect(() => {
    const controller = audioController.current;
    controller.setEnabled(audio);
    if (!ready || !exercise || !audio || phase === 'paused') {
      controller.stop();
      return;
    }
    if (phase === 'rest') void controller.speak('rest');
    else if (phase === 'prepare') void controller.speak('nextExercise');
    else void controller.speak(setIndex === 0 ? 'startExercise' : 'startSet');
    return () => controller.stop();
  }, [audio, exercise?.id, phase, ready, setIndex]);

  useEffect(() => () => audioController.current.cleanup(), []);

  const resumeCheckpoint = () => {
    if (!plan || !restoreOffer) return;
    const checkpoint = restoreOffer;
    const index = Number.isInteger(checkpoint.exerciseIndex)
      ? Math.max(0, Math.min(checkpoint.exerciseIndex, plan.exercises.length - 1)) : 0;
    const item = plan.exercises[index];
    const restoredPhase = ['prepare', 'exercise', 'rest', 'paused'].includes(checkpoint.phase) ? checkpoint.phase : 'exercise';
    const priorPhase = checkpoint.resumePhase && ['prepare', 'exercise', 'rest'].includes(checkpoint.resumePhase)
      ? checkpoint.resumePhase : 'exercise';
    const countdownPhase = restoredPhase === 'paused' ? priorPhase : restoredPhase;
    setExerciseIndex(index);
    setSetIndex(Number.isInteger(checkpoint.setIndex) ? Math.max(0, Math.min(checkpoint.setIndex, item.sets - 1)) : 0);
    setPhase(restoredPhase);
    resumePhase.current = restoredPhase === 'paused' ? priorPhase : restoredPhase;
    setRemaining(restoredCountdown(checkpoint.remainingSeconds, countdownPhase === 'rest'
      ? restSecondsOrDefault(item.restSeconds) : countdownPhase === 'prepare' ? 5 : item.type === 'time' ? item.durationSeconds ?? 30 : 0));
    setResults(checkpoint.results ?? []);
    startedAt.current = checkpoint.startedAt;
    clientId.current = checkpoint.clientId ?? createUuid();
    pendingCompletion.current = checkpoint.pendingCompletion ?? null;
    setRestored(true);
    setRestoreOffer(null);
    setReady(true);
  };

  const discardCheckpoint = async () => {
    if (!plan) return;
    if (checkpointKey) await AsyncStorage.removeItem(checkpointKey);
    startedAt.current = Date.now();
    clientId.current = createUuid();
    pendingCompletion.current = null;
    setExerciseIndex(0);
    setSetIndex(0);
    setResults([]);
    setPhase('exercise');
    setRemaining(plan.exercises[0].type === 'time' ? plan.exercises[0].durationSeconds ?? 30 : 0);
    setRestoreOffer(null);
    setReady(true);
  };
  const plannedSets = useMemo(
    () => plan?.exercises.reduce((sum, item) => sum + item.sets, 0) ?? 0,
    [plan]
  );
  const completedSets = useMemo(
    () => results.reduce(
      (total, item) => total + item.sets.filter((set) => set.status === 'completed').length,
      0
    ),
    [results]
  );

  const mergeSetResult = (
    current: ActiveWorkoutResult[],
    exerciseId: string,
    record: CompletedSetRecord
  ): ActiveWorkoutResult[] => {
    const exerciseResult = current.find((item) => item.exerciseId === exerciseId);
    if (!exerciseResult) return [...current, { exerciseId, sets: [record] }];
    return current.map((item) => item.exerciseId !== exerciseId
      ? item
      : {
          ...item,
          sets: [
            ...item.sets.filter((set) => set.setNumber !== record.setNumber),
            record,
          ].sort((a, b) => a.setNumber - b.setNumber),
        });
  };

  const addSetResult = (exerciseId: string, record: CompletedSetRecord) => {
    const next = mergeSetResult(results, exerciseId, record);
    setResults(next);
    return next;
  };

  const enterExercise = (targetExerciseIndex: number, targetSetIndex: number) => {
    const target = plan?.exercises[targetExerciseIndex];
    setExerciseIndex(targetExerciseIndex);
    setSetIndex(targetSetIndex);
    setPhase('exercise');
    resumePhase.current = 'exercise';
    setRemaining(target?.type === 'time' ? target.durationSeconds ?? 0 : 0);
  };

  const advanceAfterSet = () => {
    if (!plan || !exercise) return;
    if (setIndex + 1 < exercise.sets) {
      setPhase('rest');
      resumePhase.current = 'rest';
      setRemaining(restSecondsOrDefault(exercise.restSeconds));
    } else if (exerciseIndex + 1 < plan.exercises.length) {
      setExerciseIndex(exerciseIndex + 1);
      setSetIndex(0);
      setPhase('prepare');
      resumePhase.current = 'prepare';
      setRemaining(5);
    }
  };

  const fillMissingSets = (
    _status: 'completed' | 'endedEarly',
    currentResults: ActiveWorkoutResult[]
  ) => {
    if (!plan) return currentResults;
    return plan.exercises.map((item) => {
      const existing = currentResults.find((result) => result.exerciseId === item.id)?.sets ?? [];
      return {
        exerciseId: item.id,
        sets: Array.from({ length: item.sets }, (_, index) => {
          const setNumber = index + 1;
          return existing.find((set) => set.setNumber === setNumber) ?? {
            setNumber,
            status: 'skipped' as const,
          };
        }),
      };
    });
  };

  const finish = async (
    status: 'completed' | 'endedEarly',
    currentResults = results
  ) => {
    if (!plan || !checkpointKey || saving) return;
    setSaving(true);
    const finalResults = fillMissingSets(status, currentResults);
    const finalCompletedSets = finalResults.reduce(
      (total, item) => total + item.sets.filter((set) => set.status === 'completed').length,
      0
    );
    try {
      const payload: CompletionPayload = pendingCompletion.current ?? {
        clientId: clientId.current,
        date: new Date(startedAt.current).toISOString().slice(0, 10),
        planId: plan.id,
        day: plan.category,
        name: plan.title,
        durationMinutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
        caloriesBurned: weightKg > 0
          ? estimateSessionKcal(plan.exercises, finalResults, weightKg)
          : Math.round(plan.caloriesEstimate * Math.min(1, finalCompletedSets / Math.max(1, plannedSets))),
        completedSets: finalCompletedSets,
        plannedSets,
        status,
        results: finalResults,
      };
      pendingCompletion.current = payload;
      await AsyncStorage.setItem(checkpointKey, JSON.stringify({
        planId: plan.id, exerciseIndex, setIndex, phase, remainingSeconds: remaining,
        startedAt: startedAt.current, results: finalResults,
        clientId: clientId.current, pendingCompletion: payload,
      } satisfies ActiveWorkoutCheckpoint));
      const id = await getWorkoutRepository().recordWorkoutCompletion(payload);
      await AsyncStorage.removeItem(checkpointKey);
      router.replace(`/workout/summary?sessionId=${encodeURIComponent(id)}` as never);
    } catch (reason) {
      Alert.alert(
        'Không thể lưu buổi tập',
        reason instanceof Error ? reason.message : 'Vui lòng thử lại.'
      );
      setSaving(false);
    }
  };

  const completeSet = (actualReps?: number) => {
    if (!exercise) return;
    if (exercise.type === 'reps' && !wholeNumber(actualReps, 1, 100)) {
      Alert.alert('Số lần chưa hợp lệ', 'Nhập từ 1 đến 100 lần đã thực hiện, hoặc chọn bỏ qua nếu chưa tập.');
      return;
    }
    const nextResults = addSetResult(exercise.id, {
      setNumber: setIndex + 1,
      status: 'completed',
      repsCompleted: exercise.type === 'reps' ? actualReps ?? exercise.repsPerSet : undefined,
      durationSeconds: exercise.type === 'time' ? exercise.durationSeconds : undefined,
    });
    const isFinalSet = Boolean(
      plan && exerciseIndex === plan.exercises.length - 1 && setIndex === exercise.sets - 1
    );
    if (isFinalSet) void finish('completed', nextResults);
    else advanceAfterSet();
  };

  const skipPrepare = () => enterExercise(exerciseIndex, setIndex);

  const refreshExerciseMedia = async () => {
    const catalog = await getWorkoutRepository().listExerciseCatalog();
    setPlan(current => current ? { ...current, exercises: current.exercises.map(item => {
      const source = findCatalogMatch(item, catalog);
      return source ? { ...item, imageStartUrl: source.imageStartUrl, imageEndUrl: source.imageEndUrl } : item;
    }) } : current);
  };

  const confirmSkipExercise = () => {
    if (!exercise || saving) return;
    Alert.alert(
      'Bỏ qua bài tập?',
      `Các hiệp chưa tập của ${exercise.name} sẽ được ghi là “Bỏ qua”, không tính số lần hay kcal đã thực hiện.`,
      [
        { text: 'Tiếp tục tập', style: 'cancel' },
        { text: 'Bỏ qua bài', style: 'destructive', onPress: skipExercise },
      ]
    );
  };

  const skipExercise = () => {
    if (!plan || !exercise) return;
    let nextResults = results;
    for (let index = setIndex; index < exercise.sets; index += 1) {
      nextResults = mergeSetResult(nextResults, exercise.id, {
        setNumber: index + 1,
        status: 'skipped',
      });
    }
    setResults(nextResults);
    if (exerciseIndex + 1 < plan.exercises.length) {
      setExerciseIndex(exerciseIndex + 1);
      setSetIndex(0);
      setPhase('prepare');
      resumePhase.current = 'prepare';
      setRemaining(5);
    } else {
      void finish('endedEarly', nextResults);
    }
  };

  useEffect(() => {
    if (!plan || !ready || phase === 'paused') return;
    const isCountdown = phase === 'prepare' || phase === 'rest' ||
      (phase === 'exercise' && exercise?.type === 'time');
    if (!isCountdown || remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((current) => Math.max(0, current - 1)), 1000);
    return () => clearTimeout(timer);
  }, [exercise?.type, phase, plan, ready, remaining]);

  useEffect(() => {
    if (!plan || !ready || remaining !== 0 || phase === 'paused') return;
    if (phase === 'prepare') enterExercise(exerciseIndex, setIndex);
    else if (phase === 'rest') enterExercise(exerciseIndex, setIndex + 1);
    else if (phase === 'exercise' && exercise?.type === 'time') completeSet();
    // A zero countdown is the transition trigger; handlers intentionally use current state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, remaining, phase, exerciseIndex, setIndex]);

  useEffect(() => {
    if (!plan || !ready || !checkpointKey) return;
    const checkpoint: ActiveWorkoutCheckpoint = {
      planId: plan.id,
      exerciseIndex,
      setIndex,
      phase,
      resumePhase: resumePhase.current,
      remainingSeconds: remaining,
      startedAt: startedAt.current,
      results,
      clientId: clientId.current,
      pendingCompletion: pendingCompletion.current ?? undefined,
    };
    void AsyncStorage.setItem(checkpointKey, JSON.stringify(checkpoint));
  }, [checkpointKey, exerciseIndex, phase, plan, ready, remaining, results, setIndex]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && phase !== 'paused') {
        resumePhase.current = phase;
        setPhase('paused');
      }
    });
    return () => subscription.remove();
  }, [phase]);

  if (!plan || !exercise) {
    return (
      <View style={[styles.container, styles.center]}>
        {error ? <><Text style={styles.error}>{error}</Text><Text accessibilityRole="button" style={{ padding: 16 }} onPress={() => router.replace(`/workout/editor?id=${encodeURIComponent(planId ?? '')}` as never)}>Chỉnh kế hoạch</Text><Text accessibilityRole="button" style={{ padding: 16 }} onPress={() => router.back()}>Quay lại</Text></> : <ActivityIndicator />}
      </View>
    );
  }

  if (!ready) {
    const recorded = restoreOffer?.results ?? [];
    const done = recorded.reduce((sum, item) => sum + item.sets.filter((set) => set.status === 'completed').length, 0);
    return (
      <View style={styles.container}>
        <CheckpointRestoreModal
          visible={Boolean(restoreOffer)}
          planTitle={plan.title}
          startedAtText={restoreOffer ? new Date(restoreOffer.startedAt).toLocaleString('vi-VN') : ''}
          completedSets={done}
          totalSets={plannedSets}
          currentExerciseName={plan.exercises[restoreOffer?.exerciseIndex ?? 0]?.name ?? ''}
          progressPercent={Math.round(done * 100 / Math.max(1, plannedSets))}
          onResume={resumeCheckpoint}
          onDiscard={() => void discardCheckpoint()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActiveSessionPresentation
        key={`${exercise.id}-${setIndex}`}
        planTitle={plan.title}
        currentExercise={exercise}
        currentSetIndex={setIndex}
        totalSets={exercise.sets}
        currentExerciseIndex={exerciseIndex}
        totalExercises={plan.exercises.length}
        nextExercise={plan.exercises[exerciseIndex + 1]}
        phase={phase}
        remainingSeconds={remaining}
        completedSets={completedSets}
        plannedSets={plannedSets}
        estimatedKcal={weightKg > 0 ? estimateSessionKcal(plan.exercises, results, weightKg) : null}
        isSaving={saving}
        isAudioEnabled={audio}
        onToggleAudio={() => setAudio((value) => !value)}
        onCompleteSet={completeSet}
        onSkipRest={() => enterExercise(exerciseIndex, setIndex + 1)}
        onSkipPrepare={skipPrepare}
        onTogglePause={() => setPhase((value) => {
          if (value === 'paused') return resumePhase.current;
          resumePhase.current = value;
          return 'paused';
        })}
        onSkipExercise={confirmSkipExercise}
        onEndEarly={() => setEndModal(true)}
        onRetryMedia={refreshExerciseMedia}
      />
      {restored ? (
        <View style={styles.recoveredBanner}>
          <Text style={styles.recoveredText}>Đã khôi phục tiến độ buổi tập</Text>
        </View>
      ) : null}
      <EndEarlyModal
        visible={endModal}
        completedExercises={results.filter((item) =>
          item.sets.some((set) => set.status === 'completed')
        ).length}
        totalExercises={plan.exercises.length}
        completedSets={completedSets}
        skippedSets={Math.max(0, plannedSets - completedSets)}
        onSaveAndExit={() => {
          setEndModal(false);
          void finish('endedEarly');
        }}
        onContinue={() => setEndModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#DC2626', textAlign: 'center' },
  recoveredBanner: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recoveredText: { color: '#166534', fontSize: 12, fontWeight: '600' },
});
