import { describe, expect, it } from 'vitest';
import { mapPTPublicProfileToSummary, type PTPublicProfile } from '../types';

const profile: PTPublicProfile = {
  id: '11111111-1111-1111-1111-111111111111', full_name: 'PT kiểm thử',
  avatar_url: null, specialty: '', experience_years: null,
  price_per_session_vnd: null, rating: 0, reviews_count: 0, certificate_status: 'pending',
};

describe('trainer API data integrity', () => {
  it('preserves unpublished fields and real zero reviews without inventing a specialty', () => {
    expect(mapPTPublicProfileToSummary(profile)).toMatchObject({
      rating: 0, reviewCount: 0, sessionPriceVnd: null, experienceYears: null,
      specialties: ['Chưa cập nhật chuyên môn'], isVerified: false,
    });
  });
  it('preserves an explicitly free service and zero years of experience', () => {
    expect(mapPTPublicProfileToSummary({ ...profile, price_per_session_vnd: 0, experience_years: 0 }))
      .toMatchObject({ sessionPriceVnd: 0, experienceYears: 0 });
  });
  it.each([NaN, -1, 6, undefined])('rejects malformed rating %s instead of fabricating five stars', (rating) => {
    expect(() => mapPTPublicProfileToSummary({ ...profile, rating } as PTPublicProfile)).toThrow();
  });
  it.each([-1, 2.5, undefined])('rejects malformed prices %s instead of advertising free sessions', (price) => {
    expect(() => mapPTPublicProfileToSummary({ ...profile, price_per_session_vnd: price } as PTPublicProfile)).toThrow();
  });
});
