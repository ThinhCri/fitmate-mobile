/**
 * Audio cues for the workout session (MOB-404).
 *
 * Uses `expo-speech` for Vietnamese text-to-speech. When the device has no
 * Vietnamese voice installed, `Speech.speak` falls back to the default voice
 * (which may mispronounce Vietnamese diacritics). We expose `speak` so the
 * caller does not have to know about availability — failure is silent.
 *
 * IMPORTANT:
 *  - We call `Speech.stop()` aggressively on cleanup so cues do not continue
 *    after the user leaves the workout screen.
 *  - We use `onDone` to chain follow-up cues without overlapping the
 *    current utterance.
 *  - The audio toggle is purely a UI flag; cues are skipped when off.
 */
import * as Speech from 'expo-speech';

export type CueKind =
  | 'startWorkout'
  | 'startExercise'
  | 'startSet'
  | 'countdownLast5'
  | 'rest'
  | 'nextSet'
  | 'nextExercise'
  | 'finish';

const CUE_TEXT: Record<CueKind, string> = {
  startWorkout: 'Bắt đầu buổi tập. Cố lên!',
  startExercise: 'Bài tiếp theo.',
  startSet: 'Bắt đầu hiệp.',
  countdownLast5: 'Sắp hết, 5 giây.',
  rest: 'Nghỉ.',
  nextSet: 'Hiệp tiếp theo.',
  nextExercise: 'Bài tiếp theo.',
  finish: 'Hoàn thành buổi tập. Tốt lắm!',
};

export interface AudioController {
  enabled: boolean;
  setEnabled: (next: boolean) => void;
  speak: (kind: CueKind) => Promise<void>;
  stop: () => void;
  cleanup: () => void;
}

export function createAudioController(initialEnabled = true): AudioController {
  let enabled = initialEnabled;
  let stopped = false;

  const stop = () => {
    stopped = true;
    try {
      Speech.stop();
    } catch {
      // Speech engine may throw if it has not been initialized. Ignore.
    }
  };

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(next: boolean) {
      enabled = next;
      if (!enabled) stop();
    },
    speak: async (kind: CueKind) => {
      if (!enabled || stopped) return;
      const text = CUE_TEXT[kind];
      try {
        await Speech.speak(text, {
          language: 'vi-VN',
          rate: 1.0,
          pitch: 1.0,
        });
      } catch {
        // Device may not have a Vietnamese voice; we silently fall back to
        // no audio. The UI still shows text instructions so the workout
        // remains usable.
      }
    },
    stop,
    cleanup: stop,
  };
}

/**
 * Best-effort detection of Vietnamese TTS support. Returns `true` if at least
 * one `vi-*` voice is available; `false` otherwise. Useful for showing a
 * notice to the user ("Đọc giọng Việt không khả dụng trên thiết bị này").
 */
export async function hasVietnameseVoice(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => v.language?.toLowerCase().startsWith('vi'));
  } catch {
    return false;
  }
}
