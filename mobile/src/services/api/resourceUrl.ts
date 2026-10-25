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
