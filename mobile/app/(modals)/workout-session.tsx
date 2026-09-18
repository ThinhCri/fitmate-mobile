/**
 * Guided workout session screen (MOB-404).
 *
 * Replaces the previous "checklist + Bắt đầu/Hoàn thành" flow with a
 * dedicated coach-mode screen:
 *
 *  - One exercise + one set at a time, with a large timer (or rep counter
 *    for reps-based sets).
 *  - Auto-advance from exercise → rest → next set / next exercise via
 *    the pure `sessionEngine`. Timer is deadline-based, not decrement-based.
 *  - User controls: pause/resume, skip rest, skip exercise, end workout.
 *  - Audio cues via `expo-speech` (Vietnamese TTS, fallback to text if the
 *    device has no `vi-*` voice).
 *  - Background handling: AppState listener auto-pauses the session when
 *    the app is backgrounded; resume restores the previous status without
 *    burning the elapsed background time.
 *  - Hardware back: confirm dialog if mid-session, otherwise leave.
 *  - Cleanup: timer, audio, listeners all torn down on unmount/finish.
 *
 * This screen does NOT pretend to detect reps automatically. For reps-based
 * exercises the user taps "Xong hiệp"; the timer never auto-completes them.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  Pressable,
  ScrollView,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Dumbbell,
  Pause,
  Play,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Button, Card, ProgressBar } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';
import { useAuth } from '@/services/AuthContext';
import { mockUserService } from '@/services/mockUserService';
import {
  completeSet,
  endEarly as engineEndEarly,
  initialState,
  isLastSetLastExercise,
  remainingMs,
  skipCurrentSet,
  skipExercise as engineSkipExercise,
  skipRest,
  start as engineStart,
  tick,
  pause as enginePause,
  resume as engineResume,
  totalSets,
  type SessionInput,
  type SessionState,
} from '@/features/workout/sessionEngine';
import {
  buildSessionSummary,
  clearCheckpoint,
  hasHistorySaved,
  loadCheckpoint,
  markHistorySaved,
  saveCheckpoint,
} from '@/features/workout/sessionStorage';
import { createAudioController, hasVietnameseVoice } from '@/features/workout/audio';
import type { Exercise } from '@/types';

const SAMPLE_WORKOUT: Exercise[] = [
  {
    id: 'w-1',
    name: 'Push-up',
    type: 'reps',
    sets: 4,
    reps: 12,
    restSec: 60,
    calories: 50,
    tags: ['push', 'arm', 'upper'],
    notes:
      'Giữ lưng thẳng, hạ ngực gần sàn rồi đẩy lên. Hít vào khi hạ xuống, thở ra khi đẩy lên.',
    mediaUrl: 'https://cdn.pixabay.com/video/2022/10/04/133826-759222063_large.mp4',
    mediaType: 'video',
    mediaSource: 'Pixabay (CC0)',
  },
  {
    id: 'w-2',
    name: 'Squat',
    type: 'reps',
    sets: 4,
    reps: 15,
    restSec: 60,
    calories: 70,
    tags: ['leg', 'lower', 'glute'],
    notes:
      'Đứng rộng bằng vai, hạ hông xuống như ngồi ghế, đầu gối không vượt quá mũi chân.',
  },
  {
    id: 'w-3',
    name: 'Plank',
    type: 'time',
    sets: 3,
    durationSec: 45,
    restSec: 45,
    calories: 30,
    tags: ['core', 'abs'],
    notes: 'Giữ thân thẳng từ đầu đến chân, siết cơ bụng. Không để hông sụp xuống.',
  },
  {
    id: 'w-4',
    name: 'Lunge',
    type: 'reps',
    sets: 3,
    reps: 12,
    restSec: 60,
    calories: 55,
    tags: ['leg', 'lower', 'balance'],
    notes:
      'Bước chân dài về phía trước, hạ gối sau gần chạm sàn, đầu gối trước vuông góc.',
  },
];

const PREPARE_SEC = 5;

function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function statusLabel(s: SessionState): string {
  switch (s.status) {
    case 'prepare':
      return 'Chuẩn bị';
    case 'exercise':
      return 'Đang tập';
    case 'rest':
      return 'Nghỉ';
    case 'paused':
      return 'Tạm dừng';
    case 'finished':
      return 'Tổng kết';
    case 'idle':
    default:
      return 'Bắt đầu';
  }
}

function statusTone(s: SessionState): 'primary' | 'secondary' | 'warning' | 'success' {
  if (s.status === 'paused') return 'warning';
  if (s.status === 'rest') return 'secondary';
  if (s.status === 'finished') return 'success';
  return 'primary';
}

interface WorkoutSessionParams {
  day?: string;
}

export default function WorkoutSessionScreen() {
  const theme = useTheme();
  const { user, refresh } = useAuth();
  const params = useLocalSearchParams();
  const dayParam = (params as Record<string, string | string[] | undefined>).day;
  const day = typeof dayParam === 'string' ? dayParam : 'T2';

  // Refs that survive renders without triggering re-renders.
  const sessionIdRef = useRef<string>(`sess-${Date.now()}`);
  const startedAtMsRef = useRef<number>(Date.now());
  const endedAtMsRef = useRef<number | null>(null);
  const audioRef = useRef(createAudioController(true));
  const stateRef = useRef<SessionState>(initialState({ exercises: SAMPLE_WORKOUT }));
  const lastSpokenRef = useRef<string>(''); // dedupe cue: status+exerciseIndex+setIndex

  // Render-triggering state.
  const [state, setState] = useState<SessionState>(stateRef.current);
  const [, setTickRender] = useState(0); // forces re-render every animation frame
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [vietnameseVoiceAvailable, setVietnameseVoiceAvailable] = useState<boolean | null>(null);
  const [restoredFromCheckpoint, setRestoredFromCheckpoint] = useState(false);

  const sessionInput: SessionInput = useMemo(
    () => ({ exercises: SAMPLE_WORKOUT, prepareSec: PREPARE_SEC }),
    [],
  );

  // Detect Vietnamese TTS support once.
  useEffect(() => {
    let cancelled = false;
    hasVietnameseVoice().then((has) => {
      if (!cancelled) setVietnameseVoiceAvailable(has);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore checkpoint on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cp = await loadCheckpoint();
      if (cancelled) return;
      if (!cp) {
        stateRef.current = engineStart(sessionInput, stateRef.current);
        startedAtMsRef.current = Date.now();
        setState({ ...stateRef.current });
        return;
      }
      // Resume: keep `endsAt` if still in future, else advance.
      const restored = cp.state;
      // If engine was paused, pausedAt holds remaining ms; we restore as
      // paused so the user can explicitly resume.
      stateRef.current = restored;
      setRestoredFromCheckpoint(true);
      setState({ ...restored });
      // Persist the same checkpoint ID so we don't double-write history.
      sessionIdRef.current = cp.sessionId;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation frame loop. Triggers tick + re-render ~30fps. The actual
  // state-change is driven by tick() which only fires when the deadline
  // elapses; this avoids double transitions.
  useEffect(() => {
    if (state.status === 'idle' || state.status === 'finished') return;
    let rafId: number;
    let lastTickMs = Date.now();
    const loop = () => {
      const now = Date.now();
      if (now - lastTickMs >= 100) {
        lastTickMs = now;
        const next = tick(sessionInput, stateRef.current);
        if (next !== stateRef.current) {
          stateRef.current = next;
          setState({ ...next });
        }
      }
      setTickRender((x) => x + 1);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [state.status, sessionInput]);

  // Persist checkpoint whenever state changes.
  useEffect(() => {
    if (state.status === 'idle' || state.status === 'finished') return;
    saveCheckpoint({
      sessionId: sessionIdRef.current,
      state,
      savedAt: Date.now(),
    }).catch(() => {
      // Best-effort; ignore storage failures.
    });
  }, [state]);

  // Audio cues on transition. Only speak when status, exercise, or set
  // changes (deduped via lastSpokenRef).
  useEffect(() => {
    const key = `${state.status}|${state.exerciseIndex}|${state.setIndex}`;
    if (key === lastSpokenRef.current) return;
    lastSpokenRef.current = key;
    if (state.status === 'finished') {
      audioRef.current.speak('finish');
      return;
    }
    if (state.status === 'exercise') {
      if (state.setIndex === 0 && state.exerciseIndex === 0 && state.lastEvent === undefined) {
        audioRef.current.speak('startWorkout');
      } else if (state.setIndex === 0) {
        audioRef.current.speak('nextExercise');
      } else {
        audioRef.current.speak('nextSet');
      }
      return;
    }
    if (state.status === 'rest') {
      audioRef.current.speak('rest');
    }
  }, [state]);

  // Auto-pause when app is backgrounded. This avoids silent progression and
  // double-skipping when the user comes back hours later.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        if (stateRef.current.status !== 'paused' && stateRef.current.status !== 'finished') {
          const next = enginePause(sessionInput, stateRef.current);
          stateRef.current = next;
          setState({ ...next });
          audioRef.current.cleanup();
        }
      }
    });
    return () => sub.remove();
  }, [sessionInput]);

  // Hardware back: confirm before leaving a live session.
  useEffect(() => {
    const onBack = () => {
      if (stateRef.current.status === 'finished' || stateRef.current.status === 'idle') {
        return false; // let default back happen
      }
      Alert.alert(
        'Thoát buổi tập?',
        'Bạn có thể tiếp tục lại khi mở lại. Tiến trình đang được lưu tạm.',
        [
          { text: 'Ở lại', style: 'cancel' },
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: () => {
              router.back();
            },
          },
        ],
      );
      return true; // consume
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  // Cleanup audio on unmount.
  useEffect(() => {
    return () => {
      audioRef.current.cleanup();
    };
  }, []);

  const handlePauseToggle = useCallback(() => {
    let next: SessionState;
    if (stateRef.current.status === 'paused') {
      next = engineResume(sessionInput, stateRef.current);
    } else if (
      stateRef.current.status === 'exercise' ||
      stateRef.current.status === 'rest' ||
      stateRef.current.status === 'prepare'
    ) {
      next = enginePause(sessionInput, stateRef.current);
      audioRef.current.cleanup();
    } else {
      return;
    }
    stateRef.current = next;
    setState({ ...next });
  }, [sessionInput]);

  const handleCompleteSet = useCallback(() => {
    const next = completeSet(sessionInput, stateRef.current);
    stateRef.current = next;
    setState({ ...next });
  }, [sessionInput]);

  const handleSkipRest = useCallback(() => {
    const next = skipRest(sessionInput, stateRef.current);
    stateRef.current = next;
    setState({ ...next });
  }, [sessionInput]);

  const handleSkipSet = useCallback(() => {
    const next = skipCurrentSet(sessionInput, stateRef.current);
    stateRef.current = next;
    setState({ ...next });
  }, [sessionInput]);

  const handleSkipExercise = useCallback(() => {
    Alert.alert(
      'Bỏ qua bài này?',
      'Các hiệp còn lại của bài sẽ được ghi nhận là bỏ qua (không tính hoàn thành).',
      [
        { text: 'Ở lại', style: 'cancel' },
        {
          text: 'Bỏ qua',
          style: 'destructive',
          onPress: () => {
            const next = engineSkipExercise(sessionInput, stateRef.current);
            stateRef.current = next;
            setState({ ...next });
          },
        },
      ],
    );
  }, [sessionInput]);

  const finishSession = useCallback(
    async (next: SessionState) => {
      stateRef.current = next;
      setState({ ...next });
      audioRef.current.speak('finish');
      audioRef.current.cleanup();
      await clearCheckpoint();
      endedAtMsRef.current = Date.now();
      const summary = buildSessionSummary({
        sessionId: sessionIdRef.current,
        day,
        exercises: SAMPLE_WORKOUT,
        finalState: next,
        startedAtMs: startedAtMsRef.current,
        endedAtMs: endedAtMsRef.current,
      });
      if (!user) return;
      const alreadySaved = await hasHistorySaved(sessionIdRef.current);
      if (alreadySaved) return;
      await mockUserService.saveUser({
        ...user,
        caloriesBurned: user.caloriesBurned + summary.caloriesBurned,
        workoutHistory: [...user.workoutHistory, summary],
      });
      await markHistorySaved(sessionIdRef.current);
      await refresh();
      ToastService.show({
        message:
          summary.status === 'completed'
            ? `Hoàn thành buổi tập! Đốt ~${summary.caloriesBurned} kcal (ước tính) trong ${summary.durationMin} phút.`
            : summary.status === 'endedEarly'
            ? `Kết thúc sớm. ${summary.completedSets}/${summary.plannedSets} hiệp. Ước tính ${summary.caloriesBurned} kcal.`
            : 'Buổi tập chưa hoàn thành hiệp nào.',
        tone: summary.status === 'completed' ? 'achievement' : 'info',
      });
    },
    [day, user, refresh],
  );

  const handleEndEarly = useCallback(() => {
    Alert.alert(
      'Kết thúc sớm?',
      'Các hiệp còn lại sẽ được ghi nhận là bỏ qua. Không thể hoàn tác.',
      [
        { text: 'Ở lại', style: 'cancel' },
        {
          text: 'Kết thúc',
          style: 'destructive',
          onPress: async () => {
            const next = engineEndEarly(sessionInput, stateRef.current);
            await finishSession(next);
          },
        },
      ],
    );
  }, [sessionInput, finishSession]);

  // When state transitions to `finished`, persist + navigate.
  useEffect(() => {
    if (state.status === 'finished' && endedAtMsRef.current === null) {
      finishSession(state);
    }
  }, [state, finishSession]);

  const exercise = SAMPLE_WORKOUT[state.exerciseIndex];
  const nextExercise = SAMPLE_WORKOUT[state.exerciseIndex + 1];
  const remaining = remainingMs(sessionInput, state);
  const plan = totalSets(SAMPLE_WORKOUT);
  const done = state.progress.filter((p) => p.completed || p.skipped).length;
  const overallPct = plan > 0 ? Math.min(1, done / plan) : 0;
  const isLast = isLastSetLastExercise(sessionInput, state);
  const showCountdown = remaining > 0 && remaining <= 5000 && state.endsAt !== null && !isLast;

  const phaseDurationSec = useMemo(() => {
    if (state.status === 'rest') return exercise?.restSec ?? 0;
    if (state.status === 'exercise' && exercise?.type === 'time') return exercise.durationSec ?? 0;
    if (state.status === 'prepare') return PREPARE_SEC;
    return 0;
  }, [state.status, exercise]);
  const phaseDurationMs = phaseDurationSec * 1000;
  const phaseProgress = phaseDurationMs > 0 ? Math.max(0, Math.min(1, 1 - remaining / phaseDurationMs)) : 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }}
      edges={['top', 'bottom']}
    >
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Pressable
          onPress={() => {
            if (state.status === 'finished' || state.status === 'idle') {
              router.back();
            } else {
              handleEndEarly();
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Đóng buổi tập"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: resolveColor(theme, 'surfaceContainerLowest'),
            borderWidth: 1,
            borderColor: resolveColor(theme, 'outlineVariant'),
          }}
        >
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={20} />
        </Pressable>

        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>
            Buổi tập · {day}
          </Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
            Bài {state.exerciseIndex + 1}/{SAMPLE_WORKOUT.length} · Hiệp {state.setIndex + 1}
            {exercise ? `/${exercise.sets}` : ''}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            const next = !audioEnabled;
            setAudioEnabled(next);
            audioRef.current.setEnabled(next);
          }}
          accessibilityRole="button"
          accessibilityLabel={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: resolveColor(theme, 'surfaceContainerLowest'),
            borderWidth: 1,
            borderColor: resolveColor(theme, 'outlineVariant'),
          }}
        >
          {audioEnabled ? (
            <Volume2 color={resolveColor(theme, 'onSurface')} size={20} />
          ) : (
            <VolumeX color={resolveColor(theme, 'onSurfaceDisabled')} size={20} />
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}>
        {/* Status badge */}
        <View style={{ alignItems: 'center', gap: 6 }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor:
                statusTone(state) === 'primary'
                  ? resolveColor(theme, 'primaryContainer')
                  : statusTone(state) === 'secondary'
                  ? resolveColor(theme, 'secondaryContainer')
                  : statusTone(state) === 'warning'
                  ? resolveColor(theme, 'errorContainer')
                  : resolveColor(theme, 'tertiaryContainer'),
            }}
          >
            <Text
              style={{
                color:
                  statusTone(state) === 'primary'
                    ? resolveColor(theme, 'onPrimaryContainer')
                    : statusTone(state) === 'secondary'
                    ? resolveColor(theme, 'onSecondaryContainer')
                    : statusTone(state) === 'warning'
                    ? resolveColor(theme, 'onErrorContainer')
                    : resolveColor(theme, 'onTertiaryContainer'),
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {statusLabel(state)}
            </Text>
          </View>
          {vietnameseVoiceAvailable === false && (
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>
              Thiết bị chưa có giọng đọc tiếng Việt — hướng dẫn bằng chữ.
            </Text>
          )}
        </View>

        {/* Main exercise card */}
        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: resolveColor(theme, 'primaryContainer'),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Dumbbell color={resolveColor(theme, 'onPrimaryContainer')} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 20, fontWeight: '800' }}>
                {state.status === 'finished' ? 'Hoàn thành' : exercise?.name ?? '—'}
              </Text>
              {exercise?.type === 'time' ? (
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>
                  Hiệp {state.setIndex + 1}/{exercise.sets} · {exercise.durationSec}s/hiệp
                </Text>
              ) : exercise ? (
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>
                  Hiệp {state.setIndex + 1}/{exercise.sets} · {exercise.reps} reps
                </Text>
              ) : null}
            </View>
          </View>

          {/* Timer / Rep counter */}
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            {exercise?.type === 'reps' && state.status === 'exercise' ? (
              <Text
                style={{
                  color: resolveColor(theme, 'onSurface'),
                  fontSize: 64,
                  fontWeight: '800',
                }}
              >
                {exercise.reps}
              </Text>
            ) : state.status === 'finished' ? (
              <Text
                style={{
                  color: resolveColor(theme, 'onSurface'),
                  fontSize: 48,
                  fontWeight: '800',
                }}
              >
                {done}/{plan}
              </Text>
            ) : (
              <Text
                style={{
                  color:
                    state.status === 'paused'
                      ? resolveColor(theme, 'onSurfaceDisabled')
                      : resolveColor(theme, 'onSurface'),
                  fontSize: 72,
                  fontWeight: '800',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {formatMs(remaining)}
              </Text>
            )}
            {showCountdown && (
              <Text style={{ color: resolveColor(theme, 'warning'), fontSize: 12, fontWeight: '700' }}>
                Sắp hết — 5 giây
              </Text>
            )}
          </View>

          {/* Phase progress bar */}
          {phaseDurationMs > 0 && state.status !== 'finished' && (
            <ProgressBar
              tone="primary"
              progress={phaseProgress}
              label={state.status === 'rest' ? 'Nghỉ' : state.status === 'prepare' ? 'Chuẩn bị' : 'Đang tập'}
            />
          )}
        </Card>

        {/* Instructions / media */}
        {exercise?.notes && (
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>
              Hướng dẫn
            </Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13, lineHeight: 20 }}>
              {exercise.notes}
            </Text>
            {exercise.mediaUrl && exercise.mediaType === 'video' ? (
              <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11 }}>
                Video: {exercise.mediaSource ?? 'chưa rõ nguồn'} — trình phát video chưa được kích hoạt trong bản demo.
              </Text>
            ) : null}
          </Card>
        )}

        {/* Next-up preview while resting */}
        {state.status === 'rest' && nextExercise && (
          <Card variant="flat">
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, fontWeight: '700' }}>
              BÀI TIẾP THEO
            </Text>
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700' }}>
              {nextExercise.name}
              {nextExercise.type === 'time'
                ? ` · ${nextExercise.sets} × ${nextExercise.durationSec}s`
                : ` · ${nextExercise.sets} × ${nextExercise.reps} reps`}
            </Text>
          </Card>
        )}

        {/* Overall session progress */}
        <ProgressBar tone="primary" label="Tiến độ buổi tập" progress={overallPct} />

        {/* Restored-from-checkpoint notice */}
        {restoredFromCheckpoint && (
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, textAlign: 'center' }}>
            Đã khôi phục phiên tập từ lần mở trước.
          </Text>
        )}
      </ScrollView>

      {/* Controls */}
      <View
        style={{
          padding: 16,
          gap: 8,
          borderTopWidth: 1,
          borderTopColor: resolveColor(theme, 'outlineVariant'),
          backgroundColor: resolveColor(theme, 'surface'),
        }}
      >
        {state.status === 'finished' ? (
          <Button
            label="Về màn hình tập"
            variant="primary"
            fullWidth
            onPress={() => router.back()}
          />
        ) : (
          <>
            {state.status === 'exercise' && exercise?.type === 'reps' && (
              <Button
                label="Xong hiệp"
                variant="primary"
                fullWidth
                onPress={handleCompleteSet}
                iconLeft={<Check color={resolveColor(theme, 'onPrimary')} size={16} />}
              />
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                label={state.status === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}
                variant={state.status === 'paused' ? 'primary' : 'secondary'}
                size="md"
                style={{ flex: 1, minWidth: 120 }}
                onPress={handlePauseToggle}
                iconLeft={
                  state.status === 'paused' ? (
                    <Play color={resolveColor(theme, 'onPrimary')} size={16} />
                  ) : (
                    <Pause color={resolveColor(theme, 'onSurface')} size={16} />
                  )
                }
              />
              {state.status === 'rest' ? (
                <Button
                  label="Bỏ qua nghỉ"
                  variant="secondary"
                  size="md"
                  style={{ flex: 1, minWidth: 120 }}
                  onPress={handleSkipRest}
                  iconLeft={<SkipForward color={resolveColor(theme, 'onSurface')} size={16} />}
                />
              ) : state.status === 'exercise' ? (
                <Button
                  label="Bỏ qua hiệp"
                  variant="secondary"
                  size="md"
                  style={{ flex: 1, minWidth: 120 }}
                  onPress={handleSkipSet}
                />
              ) : null}
            </View>
            {state.status !== 'prepare' && (
              <Button
                label="Bỏ qua bài"
                variant="ghost"
                fullWidth
                onPress={handleSkipExercise}
              />
            )}
            <Button
              label="Kết thúc sớm"
              variant="tertiary"
              fullWidth
              onPress={handleEndEarly}
              iconLeft={<X color={resolveColor(theme, 'primary')} size={16} />}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
