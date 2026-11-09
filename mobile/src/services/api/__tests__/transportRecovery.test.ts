vi.mock('expo-constants', () => ({ default: { expoConfig: { android: { versionCode: 5 } } } }));
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ token: 'old', refresh: vi.fn(), transport: vi.fn(), copy: vi.fn(), remove: vi.fn() }));
vi.mock('@/services/session/sessionManager', () => ({ sessionManager: { getAccessToken: () => mocks.token, getGeneration: () => 1, getAbortSignal: () => new AbortController().signal, refreshSession: mocks.refresh } }));
vi.mock('expo/fetch', () => ({ fetch: mocks.transport }));
vi.mock('expo-file-system/legacy', () => ({ cacheDirectory: 'file:///cache/', copyAsync: mocks.copy, deleteAsync: mocks.remove }));
vi.mock('expo-file-system', () => ({ File: class extends Blob { constructor(public uri: string) { super(['image'], { type: 'image/jpeg' }); } } }));
import { apiClient, apiUploadFile } from '../client';
beforeEach(() => { vi.restoreAllMocks(); mocks.token = 'old'; mocks.refresh.mockReset(); mocks.transport.mockReset(); mocks.copy.mockReset(); mocks.remove.mockReset(); mocks.remove.mockResolvedValue(undefined); });
describe('transport recovery', () => {
 it('sends the embedded Android build code without removed Expo nativeBuildVersion', async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ ok: true }));
  vi.stubGlobal('fetch', fetcher);
  await apiClient('/me/ai-subscription');
  expect(fetcher.mock.calls[0][1].headers['X-Fitmate-Android-Version-Code']).toBe('5');
 });
 it('does not block other screens after a rate limit', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'Retry-After': '60' } })).mockResolvedValueOnce(Response.json({ ok: true }));
  vi.stubGlobal('fetch', fetcher);
  await expect(apiClient('/limited-screen')).rejects.toMatchObject({ status: 429 });
  await expect(apiClient('/another-screen')).resolves.toEqual({ ok: true });
 });
 it('reuses a token already refreshed by another request', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => { mocks.token = 'new'; return new Response('', { status: 401 }); }).mockResolvedValueOnce(Response.json({ ok: true })));
  await expect(apiClient('/protected')).resolves.toEqual({ ok: true });
  expect(mocks.refresh).not.toHaveBeenCalled();
 });
 it('refreshes authentication for multipart uploads and cleans temporary files', async () => {
  mocks.transport.mockResolvedValueOnce(new Response('', { status: 401 })).mockResolvedValueOnce(Response.json({ storageKey: 'chat/key' }));
  mocks.refresh.mockResolvedValue('new');
  await expect(apiUploadFile('/uploads', 'content://photo', 'image/jpeg', { category: 'chat' })).resolves.toEqual({ storageKey: 'chat/key' });
  expect(mocks.refresh).toHaveBeenCalledTimes(1);
  expect(mocks.transport.mock.calls[1][1].headers.Authorization).toBe('Bearer new');
  expect(mocks.transport.mock.calls[1][1].headers['X-Fitmate-Android-Version-Code']).toBe('5');
  expect(mocks.remove).toHaveBeenCalledTimes(1);
 });
 it('gives parallel uploads distinct temporary files', async () => {
  mocks.transport.mockImplementation(async () => Response.json({ storageKey: 'chat/key' }));
  await Promise.all([apiUploadFile('/uploads', 'content://one', 'image/jpeg', {}), apiUploadFile('/uploads', 'content://two', 'image/jpeg', {})]);
  expect(mocks.copy.mock.calls[0][0].to).not.toBe(mocks.copy.mock.calls[1][0].to);
 });
});
