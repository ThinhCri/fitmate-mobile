import { afterEach, describe, expect, it, vi } from 'vitest';
import { isFoodScanDemoEnabled } from '../foodScanAvailability';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('food scan demo boundary', () => {
 it('cannot enable food scanning in a release build', () => { vi.stubEnv('EXPO_PUBLIC_FOOD_SCAN_DEMO', 'true'); expect(isFoodScanDemoEnabled(false)).toBe(false); });
 it('requires explicit opt in even in development', () => { vi.stubEnv('EXPO_PUBLIC_FOOD_SCAN_DEMO', 'false'); expect(isFoodScanDemoEnabled()).toBe(false); });
 it('allows an explicitly enabled debug demo', () => { vi.stubGlobal('__DEV__', true); vi.stubEnv('EXPO_PUBLIC_FOOD_SCAN_DEMO', 'true'); expect(isFoodScanDemoEnabled()).toBe(true); });
});
