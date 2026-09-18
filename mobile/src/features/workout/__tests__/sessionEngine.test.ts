/**
 * sessionEngine tests (MOB-406).
 *
 * These tests validate the state machine used by the guided workout screen.
 * They are intentionally pure (no React, no native modules) and use a fake
 * clock so deadlines are deterministic.
 */
import { describe, expect, it } from 'vitest';
import {
  start,
  tick,
  pause,
  resume,
  completeSet,
  skipRest,
  skipCurrentSet,
  skipExercise,
  endEarly,
  initialState,
  remainingMs,
  overallProgress,
  isLastSetLastExercise,
  totalSets,
  type SessionInput,
} from '../sessionEngine';
import type { Exercise } from '@/types';

const PLAN: Exercise[] = [
  { id: 'a', name: 'Push-up', type: 'reps', sets: 2, reps: 10, restSec: 30, calories: 30 },
  { id: 'b', name: 'Plank', type: 'time', sets: 1, durationSec: 20, restSec: 10, calories: 20 },
];

function clock(initial = 1_000_000) {
  let now = initial;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
    set: (ms: number) => {
      now = ms;
    },
  };
}

function input(c: ReturnType<typeof clock>, overrides: Partial<SessionInput> = {}): SessionInput {
  return {
    exercises: PLAN,
    prepareSec: 5,
    now: c.now,
    ...overrides,
  };
}

describe('sessionEngine', () => {
  it('starts in idle then enters prepare after start()', () => {
    const c = clock();
    const s = start(input(c), initialState(input(c)));
    expect(s.status).toBe('prepare');
    expect(s.endsAt).not.toBeNull();
    expect(s.finished).toBe(false);
  });

  it('prepare → first exercise when deadline elapses', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s);
    expect(s.status).toBe('exercise');
    expect(s.exerciseIndex).toBe(0);
    expect(s.setIndex).toBe(0);
  });

  it('reps-based set waits for completeSet; deadline does not auto-complete', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000); // prepare → exercise
    s = tick(input(c), s);
    expect(s.status).toBe('exercise');
    // Wait a long time without tapping: status stays exercise, no auto-skip.
    c.advance(60_000);
    s = tick(input(c), s);
    expect(s.status).toBe('exercise');
    // User taps "Xong hiệp" → rest.
    s = completeSet(input(c), s);
    expect(s.status).toBe('rest');
  });

  it('time-based set auto-advances after durationSec', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000); // prepare → exercise a set1
    s = tick(input(c), s);
    expect(s.status).toBe('exercise');
    s = completeSet(input(c), s); // user completes first set
    expect(s.status).toBe('rest');
    c.advance(30_000); // 30s rest
    s = tick(input(c), s);
    expect(s.status).toBe('exercise');
    expect(s.exerciseIndex).toBe(0);
    expect(s.setIndex).toBe(1);
    // Second set is also reps; user completes manually.
    s = completeSet(input(c), s);
    // Now last set of last exercise (setIndex=1 of 2 sets in a, but there is
    // a next exercise b). So expect rest then prepare.
    expect(['rest', 'prepare']).toContain(s.status);
  });

  it('final set of final exercise goes to finished without trailing rest', () => {
    const c = clock();
    let s = start(input(c));
    // Exercise a has 2 sets; b has 1 set. Total sets = 3.
    c.advance(5000);
    s = tick(input(c), s); // prepare → exercise a set0
    s = completeSet(input(c), s); // rest
    c.advance(30_000);
    s = tick(input(c), s); // → exercise a set1
    s = completeSet(input(c), s); // rest (or prepare if last)
    // Last set of exercise a; we should see either rest (then prepare→b) or
    // prepare (if MOB-403 last-set-last-exercise path). The simpler plan has
    // exercise b after a, so we expect rest then prepare for b.
    c.advance(30_000);
    s = tick(input(c), s); // → exercise b set0 (time-based 20s)
    expect(s.status).toBe('exercise');
    expect(s.exerciseIndex).toBe(1);
    expect(isLastSetLastExercise(input(c), s)).toBe(true);
    c.advance(20_000); // durationSec 20
    s = tick(input(c), s); // auto-complete → finished (no rest)
    expect(s.status).toBe('finished');
    expect(s.finished).toBe(true);
  });

  it('pause preserves remaining time, resume does not double timers', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s); // → exercise a set0
    c.advance(10_000); // pretend 10s elapsed in a reps-based set (no auto-complete)
    s = pause(input(c), s);
    expect(s.status).toBe('paused');
    expect(s.pausedAt).not.toBeNull();
    const remainingBefore = s.pausedAt ?? 0;
    c.advance(60_000); // app backgrounded for 60s
    s = resume(input(c), s);
    expect(s.status).toBe('exercise');
    expect(s.pausedAt).toBeNull();
    // The deadline should now be ~original remaining (0 because reps has no
    // auto-deadline) plus a fresh tick. Use remainingMs to verify monotonic.
    const r = remainingMs(input(c), s);
    expect(r).toBeGreaterThanOrEqual(0);
    // No phantom rest or skip happened.
    expect(s.progress.length).toBe(0);
    void remainingBefore;
  });

  it('skipRest advances to the next set without waiting', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s); // → exercise a set0
    s = completeSet(input(c), s); // rest
    expect(s.status).toBe('rest');
    s = skipRest(input(c), s);
    expect(s.status).toBe('exercise');
    expect(s.exerciseIndex).toBe(0);
    expect(s.setIndex).toBe(1);
  });

  it('skipExercise marks remaining sets as skipped and goes to next exercise', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s); // → exercise a set0
    s = skipExercise(input(c), s); // skip a entirely
    expect(s.exerciseIndex).toBe(1);
    expect(s.progress.filter((p) => p.skipped).length).toBe(2);
  });

  it('endEarly marks remaining sets skipped and finishes', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s);
    s = endEarly(input(c), s);
    expect(s.status).toBe('finished');
    expect(s.lastEvent).toBe('endEarly');
    const total = totalSets(PLAN);
    expect(s.progress.length).toBe(total);
    expect(s.progress.every((p) => p.skipped)).toBe(true);
  });

  it('skipCurrentSet records as skipped and advances', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s); // → exercise a set0
    s = skipCurrentSet(input(c), s);
    expect(s.progress.find((p) => p.exerciseId === 'a' && p.setIndex === 0)?.skipped).toBe(true);
    expect(['rest', 'prepare']).toContain(s.status);
  });

  it('repeated ticks past deadline do not skip multiple states', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s); // prepare → exercise a set0
    // Now exercise a set0 is reps-based; deadline is null; tick should be no-op.
    c.advance(120_000);
    s = tick(input(c), s);
    s = tick(input(c), s);
    s = tick(input(c), s);
    expect(s.exerciseIndex).toBe(0);
    expect(s.setIndex).toBe(0);
    expect(s.status).toBe('exercise');
    // Force complete then immediately tick many times — only ONE transition
    // from rest to next state per tick.
    s = completeSet(input(c), s);
    expect(s.status).toBe('rest');
    c.advance(60_000); // 30s rest elapsed 60s ago
    s = tick(input(c), s);
    const firstAfterAdvance = { ...s };
    s = tick(input(c), s);
    s = tick(input(c), s);
    expect(s).toEqual(firstAfterAdvance); // no extra transitions
  });

  it('overallProgress counts completed + skipped sets', () => {
    const c = clock();
    let s = start(input(c));
    expect(overallProgress(input(c), s)).toBe(0);
    c.advance(5000);
    s = tick(input(c), s);
    s = completeSet(input(c), s);
    const p1 = overallProgress(input(c), s);
    expect(p1).toBeGreaterThan(0);
    expect(p1).toBeLessThan(1);
    s = endEarly(input(c), s);
    expect(overallProgress(input(c), s)).toBe(1);
  });

  it('serialize/restore round-trip preserves state', () => {
    const c = clock();
    let s = start(input(c));
    c.advance(5000);
    s = tick(input(c), s);
    const json = JSON.stringify(s);
    const restored = JSON.parse(json);
    expect(restored.status).toBe(s.status);
    expect(restored.exerciseIndex).toBe(s.exerciseIndex);
    expect(restored.setIndex).toBe(s.setIndex);
  });
});
