/**
 * Workout session engine (MOB-403).
 *
 * Pure, deterministic state machine for a guided workout session. Decoupled
 * from any React component so it can be unit-tested with vitest and reused
 * by future features (AI pacing, watch-app integration, etc.).
 *
 * Design rules:
 *  1. Time is measured from a deadline (`endsAt`) instead of decrementing a
 *     counter every second. Pause freezes the deadline; resume restores it.
 *  2. State transitions happen exactly once: `tick(now)` checks `endsAt`
 *     against `now` and triggers `advance()` only when the deadline elapses.
 *     Repeated calls cannot skip multiple states.
 *  3. Each Exercise is either `type:'time'` (auto-completes after
 *     `durationSec`) or `type:'reps'` (waits for explicit `completeSet`).
 *  4. The final set of the final exercise transitions to `finished` WITHOUT
 *     inserting a meaningless trailing rest.
 *  5. Sessions can be serialized for checkpoint/restore (see `serialize` /
 *     `restore`). `endsAt` is stored as absolute epoch ms so restore is
 *     accurate regardless of how long the app was suspended.
 *  6. Skipping a set/exercise produces a `skipped` marker in `progress`
 *     rather than a `completed` one — see MOB-405.
 */

import type { Exercise } from '@/types';

export type SessionStatus =
  | 'idle' // never started
  | 'prepare' // countdown before first exercise
  | 'exercise' // active set
  | 'rest' // between sets
  | 'paused' // user-initiated pause (overlays exercise/rest)
  | 'finished'; // all planned work done

/**
 * Per-set progress entry. Order matches the plan; one entry per set.
 * `completed` true means the user finished the set; `skipped` true means the
 * user explicitly skipped it (e.g. via Skip exercise). Both cannot be true.
 */
export interface SetProgress {
  exerciseId: string;
  setIndex: number; // 0-based
  completed: boolean;
  skipped: boolean;
}

export interface SessionState {
  status: SessionStatus;
  exerciseIndex: number; // 0-based
  setIndex: number; // 0-based within current exercise
  /** Absolute epoch ms when the current phase (prepare/exercise/rest) ends. */
  endsAt: number | null;
  /** Epoch ms when paused; null when not paused. */
  pausedAt: number | null;
  /** Status before pause; restored on resume. */
  prevStatus: SessionStatus | null;
  /** Cumulative progress across all sets so far. */
  progress: SetProgress[];
  /** True iff the most recent transition was triggered by the user. */
  lastEvent?: 'complete' | 'skip' | 'pause' | 'resume' | 'endEarly';
  /** True once all planned sets are resolved (completed or skipped). */
  finished: boolean;
}

export interface SessionInput {
  exercises: Exercise[];
  /** Optional fixed length of the "Prepare" countdown. Defaults to 5s. */
  prepareSec?: number;
  /** Inject a clock for testing — `Date.now` is the default. */
  now?: () => number;
}

/**
 * Compute the planned total number of sets across all exercises. Used to
 * know when the final set has been reached (no trailing rest).
 */
export function totalSets(exercises: Exercise[]): number {
  return exercises.reduce((acc, ex) => acc + ex.sets, 0);
}

/**
 * How long the current phase lasts in seconds. For time-based exercises the
 * duration is the per-set duration; for reps-based the engine waits for the
 * user's "Xong hiệp" button (a generous upper-bound so the timer does not
 * auto-expire unless the user wants to — current UI does not count down reps
 * because we cannot measure reps automatically). Rest is `restSec`.
 */
function phaseDurationSec(state: SessionState, input: { exercises: Exercise[]; prepareSec?: number }): number {
  const { exercises, prepareSec = 5 } = input;
  if (state.status === 'prepare') return prepareSec;
  if (state.status === 'finished' || state.status === 'idle' || state.status === 'paused') return 0;
  const ex = exercises[state.exerciseIndex];
  if (!ex) return 0;
  if (state.status === 'exercise') {
    return ex.type === 'time' ? ex.durationSec ?? 0 : 0;
  }
  if (state.status === 'rest') {
    // Trailing transition rest between exercises is optional.
    return ex.restSec ?? 0;
  }
  return 0;
}

export function initialState(input: SessionInput): SessionState {
  const now = input.now?.() ?? Date.now();
  const base: SessionState = {
    status: 'idle',
    exerciseIndex: 0,
    setIndex: 0,
    endsAt: null,
    pausedAt: null,
    prevStatus: null,
    progress: [],
    finished: false,
    lastEvent: undefined,
  };
  Object.defineProperty(base, 'createdAt', {
    value: now,
    enumerable: false,
  });
  return base;
}

/**
 * Begin a fresh session. Sets status to `prepare` and starts a 5s countdown
 * (configurable). After prepare elapses, advance() moves to the first set.
 */
export function start(input: SessionInput, state: SessionState = initialState(input)): SessionState {
  if (state.status !== 'idle' && state.status !== 'finished') return state;
  const now = input.now?.() ?? Date.now();
  const next: SessionState = {
    ...state,
    status: 'prepare',
    exerciseIndex: 0,
    setIndex: 0,
    endsAt: now + (input.prepareSec ?? 5) * 1000,
    pausedAt: null,
    prevStatus: null,
    progress: state.progress.length ? state.progress : [],
    finished: false,
    lastEvent: undefined,
  };
  return next;
}

/**
 * Pause an in-progress phase. `endsAt` is converted to `remainingMs` and
 * stored in `pausedAt` (semantically: "this many ms remaining when paused").
 * Calling tick while paused is a no-op.
 */
export function pause(input: SessionInput, state: SessionState): SessionState {
  if (state.status !== 'exercise' && state.status !== 'rest' && state.status !== 'prepare') return state;
  if (state.pausedAt !== null) return state;
  const now = input.now?.() ?? Date.now();
  const remaining = Math.max(0, (state.endsAt ?? now) - now);
  return {
    ...state,
    status: 'paused',
    prevStatus: state.status,
    pausedAt: remaining,
    endsAt: null,
    lastEvent: 'pause',
  };
}

/**
 * Resume from a paused state. `endsAt` is recomputed from `pausedAt` so the
 * remaining duration is preserved exactly. The status is restored to the
 * one stored in `prevStatus`.
 */
export function resume(input: SessionInput, state: SessionState): SessionState {
  if (state.status !== 'paused' || state.pausedAt === null) return state;
  const now = input.now?.() ?? Date.now();
  const restoreTo: SessionStatus = state.prevStatus ?? 'exercise';
  return {
    ...state,
    status: restoreTo,
    endsAt: now + state.pausedAt,
    pausedAt: null,
    prevStatus: null,
    lastEvent: 'resume',
  };
}

/**
 * Determine which non-paused status to return to after a resume. The
 * previous status is tracked in `prevStatus` (set by `pause`). This helper
 * remains for backwards-compat / tests.
 */
function deriveResumeStatus(state: SessionState): SessionStatus {
  return state.prevStatus ?? 'exercise';
}

/**
 * Advance the state machine by wall-clock time. Returns a NEW state if a
 * transition occurred (the deadline elapsed, the timer ran out for the
 * current set/rest). Otherwise returns the same reference.
 *
 * Critically: even if tick is called many times after the deadline, only one
 * transition happens per call (no double-skipping sets/exercises).
 */
export function tick(input: SessionInput, state: SessionState): SessionState {
  if (state.status === 'paused' || state.status === 'idle' || state.status === 'finished') return state;
  if (state.endsAt === null) return state;
  const now = input.now?.() ?? Date.now();
  if (now < state.endsAt) return state;
  // Deadline elapsed → advance exactly once.
  return advance(input, state);
}

/**
 * Manually complete the current set (for reps-based exercises where the user
 * taps "Xong hiệp"). Records progress and advances.
 */
export function completeSet(input: SessionInput, state: SessionState): SessionState {
  if (state.status !== 'exercise') return state;
  const ex = input.exercises[state.exerciseIndex];
  if (!ex) return state;
  const updatedProgress = appendProgress(state.progress, ex.id, state.setIndex, { completed: true });
  return moveForward(input, { ...state, progress: updatedProgress }, 'complete');
}

/**
 * Skip the current set (records as skipped in progress).
 */
export function skipCurrentSet(input: SessionInput, state: SessionState): SessionState {
  if (state.status !== 'exercise' && state.status !== 'rest') return state;
  const ex = input.exercises[state.exerciseIndex];
  if (!ex) return state;
  const updatedProgress = appendProgress(state.progress, ex.id, state.setIndex, { skipped: true });
  return moveForward(input, { ...state, progress: updatedProgress }, 'skip');
}

/**
 * Skip the rest period. Goes straight to the next set (or the next exercise).
 */
export function skipRest(input: SessionInput, state: SessionState): SessionState {
  if (state.status !== 'rest') return state;
  return advance(input, state);
}

/**
 * Skip the current exercise entirely (all remaining sets marked skipped).
 * Goes to the next exercise (or finishes).
 */
export function skipExercise(input: SessionInput, state: SessionState): SessionState {
  if (state.status !== 'exercise' && state.status !== 'rest') return state;
  const ex = input.exercises[state.exerciseIndex];
  if (!ex) return state;
  const remaining = ex.sets - state.setIndex;
  const skipped: SetProgress[] = Array.from({ length: remaining }, (_, i) => ({
    exerciseId: ex.id,
    setIndex: state.setIndex + i,
    completed: false,
    skipped: true,
  }));
  const nextState: SessionState = {
    ...state,
    progress: [...state.progress, ...skipped],
    exerciseIndex: state.exerciseIndex + 1,
    setIndex: 0,
  };
  return moveForward(input, nextState, 'skip');
}

/**
 * End the session early. All remaining sets are recorded as skipped.
 */
export function endEarly(input: SessionInput, state: SessionState): SessionState {
  if (state.status === 'finished' || state.status === 'idle') return state;
  const remainingProgress: SetProgress[] = [];
  for (let exIdx = state.exerciseIndex; exIdx < input.exercises.length; exIdx++) {
    const ex = input.exercises[exIdx];
    const startSet = exIdx === state.exerciseIndex ? state.setIndex : 0;
    for (let s = startSet; s < ex.sets; s++) {
      remainingProgress.push({
        exerciseId: ex.id,
        setIndex: s,
        completed: false,
        skipped: true,
      });
    }
  }
  return {
    ...state,
    progress: [...state.progress, ...remainingProgress],
    status: 'finished',
    finished: true,
    endsAt: null,
    pausedAt: null,
    lastEvent: 'endEarly',
  };
}

/**
 * Internal: drive the machine to the next phase. Used by tick() when the
 * deadline elapses and by manual skip/complete actions.
 */
function advance(input: SessionInput, state: SessionState): SessionState {
  return moveForward(input, state, state.lastEvent === 'skip' ? 'skip' : 'complete');
}

function moveForward(
  input: SessionInput,
  state: SessionState,
  event: 'complete' | 'skip',
): SessionState {
  const { exercises } = input;
  const ex = exercises[state.exerciseIndex];

  // From prepare → first exercise
  if (state.status === 'prepare') {
    if (!ex) return finish(state, event);
    return enterExercise(input, state, event);
  }

  // From rest → next set of current exercise
  if (state.status === 'rest') {
    const nextSetIndex = state.setIndex + 1;
    if (ex && nextSetIndex < ex.sets) {
      return enterExerciseSet(input, { ...state, setIndex: nextSetIndex }, event);
    }
    // Move to next exercise
    return enterNextExercise(input, state, event);
  }

  // From exercise → either rest (more sets), next exercise, or finish.
  if (state.status === 'exercise') {
    if (!ex) return finish(state, event);
    // Auto-progress only for time-based sets; for reps-based sets the UI
    // calls completeSet() explicitly. If we land here with no progress entry
    // it means the deadline elapsed for a time-based set.
    const progressEntryForCurrent = state.progress.find(
      (p) => p.exerciseId === ex.id && p.setIndex === state.setIndex,
    );
    const updatedProgress = progressEntryForCurrent
      ? state.progress
      : appendProgress(state.progress, ex.id, state.setIndex, { completed: true });
    const stateWithProgress = { ...state, progress: updatedProgress };
    const nextSetIndex = state.setIndex + 1;
    if (nextSetIndex < ex.sets) {
      // Rest between sets (skip if last set of last exercise).
      const isLastSetOfLastExercise = state.exerciseIndex === exercises.length - 1;
      if (isLastSetOfLastExercise) {
        return enterNextExercise(input, stateWithProgress, event);
      }
      return enterRest(input, stateWithProgress, event);
    }
    // Last set of this exercise: go to next exercise (or finish).
    return enterNextExercise(input, stateWithProgress, event);
  }

  return state;
}

function enterPrepare(
  input: SessionInput,
  state: SessionState,
  event: 'complete' | 'skip',
): SessionState {
  const now = input.now?.() ?? Date.now();
  return {
    ...state,
    status: 'prepare',
    endsAt: now + (input.prepareSec ?? 5) * 1000,
    pausedAt: null,
    lastEvent: event,
  };
}

function enterExercise(
  input: SessionInput,
  state: SessionState,
  event: 'complete' | 'skip',
): SessionState {
  return enterExerciseSet(input, state, event);
}

function enterExerciseSet(
  input: SessionInput,
  state: SessionState,
  event: 'complete' | 'skip',
): SessionState {
  const ex = input.exercises[state.exerciseIndex];
  const now = input.now?.() ?? Date.now();
  if (!ex) return finish(state, event);
  const durationMs = (ex.type === 'time' ? (ex.durationSec ?? 0) : 0) * 1000;
  return {
    ...state,
    status: 'exercise',
    endsAt: durationMs > 0 ? now + durationMs : null,
    pausedAt: null,
    lastEvent: event,
  };
}

function enterRest(
  input: SessionInput,
  state: SessionState,
  event: 'complete' | 'skip',
): SessionState {
  const ex = input.exercises[state.exerciseIndex];
  const now = input.now?.() ?? Date.now();
  const restSec = ex?.restSec ?? 0;
  return {
    ...state,
    status: 'rest',
    endsAt: restSec > 0 ? now + restSec * 1000 : null,
    pausedAt: null,
    lastEvent: event,
  };
}

function enterNextExercise(
  input: SessionInput,
  state: SessionState,
  event: 'complete' | 'skip',
): SessionState {
  const { exercises } = input;
  const nextIdx = state.exerciseIndex + 1;
  if (nextIdx >= exercises.length) return finish(state, event);
  const nextExercise = exercises[nextIdx];
  const baseState = {
    ...state,
    exerciseIndex: nextIdx,
    setIndex: 0,
  };
  // Trailing transition rest is optional (restAfterSec); if absent, go straight
  // into prepare→exercise. We currently use the prepare countdown for
  // visibility, so a small pause helps the user know the next exercise is
  // coming.
  void nextExercise;
  return enterPrepare(input, baseState, event);
}

function finish(state: SessionState, event: 'complete' | 'skip' | 'endEarly'): SessionState {
  return {
    ...state,
    status: 'finished',
    finished: true,
    endsAt: null,
    pausedAt: null,
    lastEvent: event,
  };
}

function appendProgress(
  progress: SetProgress[],
  exerciseId: string,
  setIndex: number,
  patch: Partial<SetProgress>,
): SetProgress[] {
  const existing = progress.find((p) => p.exerciseId === exerciseId && p.setIndex === setIndex);
  if (existing) {
    return progress.map((p) =>
      p === existing ? { ...p, ...patch } : p,
    );
  }
  return [...progress, { exerciseId, setIndex, completed: false, skipped: false, ...patch }];
}

/**
 * Remaining ms for the current phase, computed from `endsAt` (or `pausedAt`
 * while paused). Returns 0 when no phase is active.
 */
export function remainingMs(input: SessionInput, state: SessionState, nowMs?: number): number {
  if (state.status === 'paused') return state.pausedAt ?? 0;
  if (state.status === 'idle' || state.status === 'finished' || state.endsAt === null) return 0;
  const now = nowMs ?? input.now?.() ?? Date.now();
  return Math.max(0, state.endsAt - now);
}

/**
 * Progress fraction 0..1 across the entire plan (counting completed+skipped
 * sets). Useful for the progress bar.
 */
export function overallProgress(input: SessionInput, state: SessionState): number {
  const total = totalSets(input.exercises);
  if (total === 0) return 1;
  const done = state.progress.filter((p) => p.completed || p.skipped).length;
  return Math.min(1, done / total);
}

/**
 * Serialize the state for checkpointing. Returns a JSON-safe object. The
 * clock is NOT included — when restoring, pass a new `now` so the engine can
 * recompute `remainingMs` correctly across suspension.
 */
export function serialize(state: SessionState): string {
  return JSON.stringify(state);
}

export function restore(input: SessionInput, json: string, nowMs?: number): SessionState {
  const parsed = JSON.parse(json) as SessionState;
  // If the engine was paused, pausedAt is the remaining ms at pause time;
  // that's still valid after restore.
  // If it was running with an absolute deadline, the deadline may already
  // have elapsed while suspended — the next tick() will advance accordingly
  // (and the UI should auto-pause on background to avoid silent skips, see
  // MOB-404).
  void nowMs;
  return parsed;
}

/**
 * Helper used by the UI to decide whether it is the very last set of the
 * very last exercise. Used to suppress a trailing rest countdown.
 */
export function isLastSetLastExercise(input: SessionInput, state: SessionState): boolean {
  const ex = input.exercises[state.exerciseIndex];
  if (!ex) return false;
  if (state.exerciseIndex !== input.exercises.length - 1) return false;
  return state.setIndex === ex.sets - 1;
}
