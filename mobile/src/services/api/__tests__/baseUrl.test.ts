import { afterEach, describe, expect, it } from 'vitest';
import { getApiBaseUrl } from '../baseUrl';

describe('API base URL configuration', () => {
  const original = process.env.EXPO_PUBLIC_API_BASE_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = original;
  });

  it('uses the emulator address only in development when not configured', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(getApiBaseUrl()).toBe('http://10.0.2.2:8080/api/v1');
  });

  it('accepts a configured HTTPS API address', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.fitmate.vn/api/v1/';
    expect(getApiBaseUrl()).toBe('https://api.fitmate.vn/api/v1');
  });

  it('rejects malformed paths and embedded credentials', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://user:pass@api.fitmate.vn/api/v1';
    expect(getApiBaseUrl).toThrow();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.fitmate.vn/not-api';
    expect(getApiBaseUrl).toThrow();
  });
});
