export const MAX_REST_SECONDS = 600;
export const DEFAULT_REST_SECONDS = 45;

export function isValidRestSeconds(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_REST_SECONDS;
}

export function restSecondsOrDefault(value: unknown): number {
  return isValidRestSeconds(value) ? value : DEFAULT_REST_SECONDS;
}

export function restoredCountdown(value: unknown, phaseMaximum: number): number {
  const limit = Number.isFinite(phaseMaximum) ? Math.max(0, Math.floor(phaseMaximum)) : 0;
  if (typeof value !== 'number' || !Number.isFinite(value)) return limit;
  return Math.max(0, Math.min(limit, Math.floor(value)));
}

export function formatWorkoutTimer(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0 || !Number.isSafeInteger(Math.floor(seconds))) return '--:--';
  const total = Math.floor(seconds);
  const part = (value: number) => String(value).padStart(2, '0');
  if (total >= 3600) return `${part(Math.floor(total / 3600))}:${part(Math.floor(total / 60) % 60)}:${part(total % 60)}`;
  return `${part(Math.floor(total / 60))}:${part(total % 60)}`;
}
