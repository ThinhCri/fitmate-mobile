import { describe, expect, it } from 'vitest';
import { mapPTPublicDetailToDetail, mapPTPublicProfileToSummary, type PTPublicProfile } from '../types';

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
  it('resolves relative trainer avatar URLs and preserves presigned remote URLs', () => {
    const prevEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.fitmate.site/api/v1';
    try {
      expect(mapPTPublicProfileToSummary({ ...profile, avatar_url: '/uploads/avatars/pt.jpg?sig=1' }).avatarUrl)
        .toBe('https://api.fitmate.site/uploads/avatars/pt.jpg?sig=1');
      expect(mapPTPublicProfileToSummary({ ...profile, avatar_url: 'https://media.r2.test/avatars/pt.jpg?X-Amz-Signature=abc' }).avatarUrl)
        .toBe('https://media.r2.test/avatars/pt.jpg?X-Amz-Signature=abc');
    } finally {
      if (prevEnv === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
      else process.env.EXPO_PUBLIC_API_BASE_URL = prevEnv;
    }
  });
  it('merges public reviews summary into trainer detail with reviewer names', () => {
    const detail = mapPTPublicDetailToDetail(
      { ...profile, bio: 'PT test', services: [] },
      {
        average_rating: 4.8,
        total_reviews: 2,
        reviews: [
          {
            id: 'rev-1',
            from_user_id: 'u-1',
            reviewer_name: 'Nguyễn Văn A',
            pt_user_id: profile.id,
            rating: 5,
            text: 'Dạy rất có tâm!',
            created_at: '2026-11-26T10:00:00Z',
          },
          {
            id: 'rev-2',
            from_user_id: 'u-2',
            reviewer_name: '   ',
            pt_user_id: profile.id,
            rating: 4,
            text: 'Ổn áp',
            created_at: '2026-11-25T10:00:00Z',
          },
        ],
      }
    );
    expect(detail.rating).toBe(4.8);
    expect(detail.reviewCount).toBe(2);
    expect(detail.reviews).toHaveLength(2);
    expect(detail.reviews[0]).toMatchObject({ reviewerName: 'Nguyễn Văn A', rating: 5, comment: 'Dạy rất có tâm!' });
    expect(detail.reviews[1].reviewerName).toBe('Học viên Fitmate');
  });
});
