import {
  TrainerSummaryViewModel,
  TrainerDetailViewModel,
} from '@/services/api/types';
import type { ITrainerRepository } from '../trainerRepository';
import { DEFAULT_USERS } from '@/mocks/fixtures';

export class PreviewTrainerRepository implements ITrainerRepository {
  async listTrainers(filter?: {
    specialty?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ items: TrainerSummaryViewModel[]; nextCursor?: string | null }> {
    const ptUsers = Object.values(DEFAULT_USERS).filter(
      (u) => u.role === 'pt' || u.profile?.isPt
    );

    let items: TrainerSummaryViewModel[] = ptUsers.map((u) => ({
      id: u.id,
      name: u.profile?.name || 'Huấn luyện viên',
      avatarUrl: u.profile?.avatar || null,
      specialties: u.profile?.spec && u.profile.spec.length > 0 ? u.profile.spec : ['Thể hình'],
      rating: 4.9,
      reviewCount: u.reviews?.length || 15,
      sessionPriceVnd: u.profile?.price || 300000,
      experienceYears: u.profile?.exp || 3,
      isVerified: u.profile?.isVerified ?? (u.profile?.certificateStatus === 'verified'),
    }));

    if (filter?.specialty && filter.specialty !== 'all') {
      const q = filter.specialty.toLowerCase();
      items = items.filter((t) =>
        t.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    const limit = filter?.limit || 10;
    return {
      items: items.slice(0, limit),
      nextCursor: null,
    };
  }

  async getTrainer(id: string): Promise<TrainerDetailViewModel> {
    const user = Object.values(DEFAULT_USERS).find(
      (u) => (u.role === 'pt' || u.profile?.isPt) && (u.id === id || u.email === id)
    );

    if (!user) {
      const err = new Error(`Trainer ${id} not found in preview data`);
      (err as any).status = 404;
      throw err;
    }

    return {
      id: user.id,
      name: user.profile?.name || 'Huấn luyện viên',
      avatarUrl: user.profile?.avatar || null,
      specialties: user.profile?.spec && user.profile.spec.length > 0 ? user.profile.spec : ['Thể hình'],
      rating: 4.9,
      reviewCount: user.reviews?.length || 15,
      sessionPriceVnd: user.profile?.price || 300000,
      experienceYears: user.profile?.exp || 3,
      isVerified: user.profile?.isVerified ?? (user.profile?.certificateStatus === 'verified'),
      bio: user.profile?.bio || '',
      services: [
        {
          id: 'svc-1',
          name: 'Buổi tập 1:1 tiêu chuẩn',
          description: 'Kèm riêng kỹ thuật, giáo án cá nhân hóa theo mục tiêu.',
          priceVnd: user.profile?.price || 300000,
          durationMinutes: 60,
          isActive: true,
        },
      ],
      reviews: (user.reviews || []).map((r: any, idx: number) => ({
        id: r.id || `rev-${idx}`,
        reviewerId: r.author || 'member-1',
        rating: r.rating || 5,
        comment: r.comment || '',
        createdAt: r.date || '2026-03-01T00:00:00Z',
      })),
    };
  }
}

export const previewTrainerRepository = new PreviewTrainerRepository();
