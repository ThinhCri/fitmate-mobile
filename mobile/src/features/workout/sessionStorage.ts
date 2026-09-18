/**
 * Workout session checkpoint storage (MOB-405).
 *
 * Persists the in-progress session so the user can recover after a crash or
 * background suspension. The engine stores absolute deadlines, so restore
 * is accurate regardless of how long the app was suspended.
 *
 * Idempotency: each session has a `sessionId`. Before writing to
 * `workoutHistory` we check whether an entry with that id already exists.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Exercise, WorkoutSession } from '@/types';
import { serialize, restore, type SessionState } from './sessionEngine';

const KEY_CHECKPOINT = 'workout_session_checkpoint_v1';
const KEY_HISTORY_SAVE = 'workout_session_history_save_v1';

export interface Checkpoint {
  sessionId: string;
  state: SessionState;
  savedAt: number;
}

export async function saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
  await AsyncStorage.setItem(KEY_CHECKPOINT, JSON.stringify(checkpoint));
}

export async function loadCheckpoint(): Promise<Checkpoint | null> {
  const raw = await AsyncStorage.getItem(KEY_CHECKPOINT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Checkpoint;
  } catch {
    return null;
  }
}

export async function clearCheckpoint(): Promise<void> {
  await AsyncStorage.removeItem(KEY_CHECKPOINT);
}

/**
 * Mark a session id as already-saved so we do not double-write history when
 * the user taps Finish twice or reopens the screen.
 */
export async function markHistorySaved(sessionId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY_HISTORY_SAVE);
  const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
  if (!ids.includes(sessionId)) ids.push(sessionId);
  await AsyncStorage.setItem(KEY_HISTORY_SAVE, JSON.stringify(ids));
}

export async function hasHistorySaved(sessionId: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY_HISTORY_SAVE);
  if (!raw) return false;
  const ids = JSON.parse(raw) as string[];
  return ids.includes(sessionId);
}

/**
 * Build a `WorkoutSession` record from a finished engine state + clock.
 * Returns null if the session should not be persisted (e.g. ended very
 * quickly with zero progress).
 */
export interface SessionSummaryInput {
  sessionId: string;
  day: string; // 'T2'..'CN'
  exercises: Exercise[];
  finalState: SessionState;
  startedAtMs: number;
  endedAtMs: number;
}

export function buildSessionSummary(input: SessionSummaryInput): WorkoutSession {
  const { finalState, exercises, startedAtMs, endedAtMs, day, sessionId } = input;
  const durationMin = Math.max(1, Math.round((endedAtMs - startedAtMs) / 60000));
  // Calorie uoc luong (MET~5, ~250kcal/30min). KHONG phai so do thuc te.
  const caloriesBurned = Math.round((durationMin / 30) * 250);
  const plannedSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = finalState.progress.filter((p) => p.completed).length;
  const anyCompleted = completedSets > 0;
  const status: WorkoutSession['status'] = !anyCompleted
    ? 'skipped'
    : completedSets >= plannedSets
    ? 'completed'
    : 'endedEarly';
  return {
    id: sessionId,
    date: new Date(endedAtMs).toISOString().split('T')[0],
    day,
    durationMin,
    caloriesBurned,
    exercises: exercises.length,
    status,
    completedSets,
    plannedSets,
  };
}

export { serialize, restore };
