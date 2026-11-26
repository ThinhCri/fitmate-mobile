import { getApiBaseUrl } from './baseUrl';

export function normalizeApiResourceUrl(value: string, apiBaseUrl: string): string {
  try {
    const apiOrigin = new URL(apiBaseUrl).origin;
    if (value.startsWith('/') && !value.startsWith('//')) return apiOrigin + value;
    const resource = new URL(value);
    if (['localhost', '127.0.0.1', '10.0.2.2'].includes(resource.hostname)) {
      return apiOrigin + resource.pathname + resource.search + resource.hash;
    }
    return value;
  } catch { return value; }
}

export function resolveOptionalApiResourceUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    return normalizeApiResourceUrl(value, getApiBaseUrl());
  } catch {
    return value;
  }
}

/** Persist shared catalog identity, never a temporary R2 signature. */
export function stableWorkoutMediaReference(value?: string): string | undefined {
  if (!value || value.length > 8000) return value;
  let path: string;
  if (value.startsWith('storage://')) path = value.slice(10);
  else {
    try { path = new URL(value, 'https://relative.invalid').pathname; }
    catch { return value; }
  }
  const match = path.match(/(?:^|\/)(exercise-catalog\/[A-Za-z0-9_-]+\/[01]\.jpg)$/);
  return match ? `storage://${match[1]}` : value;
}
