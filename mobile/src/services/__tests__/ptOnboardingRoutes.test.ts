import { describe, expect, it } from 'vitest';
import { canAccessUnverifiedPtPath } from '../ptOnboardingRoutes';

describe('unverified PT onboarding routes', () => {
  it('allows the certificate and phone verification screens', () => {
    expect(canAccessUnverifiedPtPath('/pt/certificates')).toBe(true);
    expect(canAccessUnverifiedPtPath('/pt/verify-phone')).toBe(true);
  });

  it('allows authentication routes for signing out and in', () => {
    expect(canAccessUnverifiedPtPath('/(auth)/login')).toBe(true);
  });

  it('keeps other PT pages and prefix lookalikes blocked', () => {
    expect(canAccessUnverifiedPtPath('/pt/revenue')).toBe(false);
    expect(canAccessUnverifiedPtPath('/pt/certificates-other')).toBe(false);
    expect(canAccessUnverifiedPtPath('/pt/verify-phone-other')).toBe(false);
  });
});
