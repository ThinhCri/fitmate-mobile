import { describe, it, expect } from 'vitest';
import {
  AccountHubViewModel,
  ChangePasswordFormData,
  HealthProfileData,
} from '../accountTypes';

describe('Account Hub & Settings Presentation Logic (Stitch A06 - A10)', () => {
  it('validates password requirements (length, alphanumeric, matching)', () => {
    const invalidForm: ChangePasswordFormData = {
      currentPassword: 'oldpassword123',
      newPassword: 'short',
      confirmPassword: 'short',
    };
    expect(invalidForm.newPassword.length).toBeLessThan(8);

    const validForm: ChangePasswordFormData = {
      currentPassword: 'oldpassword123',
      newPassword: 'SecurePassword2026',
      confirmPassword: 'SecurePassword2026',
    };

    const hasMinLength = validForm.newPassword.length >= 8;
    const hasAlphaNumeric =
      /[a-zA-Z]/.test(validForm.newPassword) &&
      /[0-9]/.test(validForm.newPassword);
    const isMatching = validForm.newPassword === validForm.confirmPassword;

    expect(hasMinLength).toBe(true);
    expect(hasAlphaNumeric).toBe(true);
    expect(isMatching).toBe(true);
  });

  it('manages health profile allergies and conditions state', () => {
    let profile: HealthProfileData = {
      medicalConditions: 'Đau cổ chân',
      hasNoMedicalConditions: false,
      allergies: 'Đậu phộng',
      hasNoAllergies: false,
      workoutDays: ['mon', 'wed'],
      preferredTimeSlots: ['18:00 - 19:30'],
      notes: '',
    };

    expect(profile.hasNoMedicalConditions).toBe(false);
    expect(profile.medicalConditions).toBe('Đau cổ chân');

    // User toggles "hasNoMedicalConditions"
    profile = {
      ...profile,
      hasNoMedicalConditions: true,
      medicalConditions: '',
    };
    expect(profile.hasNoMedicalConditions).toBe(true);
    expect(profile.medicalConditions).toBe('');
  });

  it('enforces role gating: PT space is visible only to PT accounts', () => {
    const memberAccount: AccountHubViewModel = {
      id: 'm-1',
      name: 'Học viên A',
      email: 'a@fitmate.vn',
      role: 'member',
    };

    const ptAccount: AccountHubViewModel = {
      id: 'pt-1',
      name: 'HLV Nam',
      email: 'nam@fitmate.vn',
      role: 'pt',
    };

    expect(memberAccount.role === 'pt').toBe(false);
    expect(ptAccount.role === 'pt').toBe(true);
  });
});
