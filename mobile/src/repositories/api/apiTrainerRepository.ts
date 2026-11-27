import {
  TrainerSummaryViewModel,
  TrainerDetailViewModel,
  mapPTPublicProfileToSummary,
  mapPTPublicDetailToDetail,
} from '@/services/api/types';
import type { ITrainerRepository } from '../trainerRepository';
import { trainersService } from '@/services/api/trainersService';

export class ApiTrainerRepository implements ITrainerRepository {
  async listTrainers(filter?: {
    specialty?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ items: TrainerSummaryViewModel[]; nextCursor?: string | null }> {
    const response = await trainersService.listTrainers(filter);
    return {
      items: (response.items || []).map(mapPTPublicProfileToSummary),
      nextCursor: response.nextCursor,
    };
  }

  async getTrainer(id: string): Promise<TrainerDetailViewModel> {
    const [raw, reviewsSummary] = await Promise.all([
      trainersService.getTrainer(id),
      trainersService.getTrainerReviews(id, 50).catch(() => null),
    ]);
    return mapPTPublicDetailToDetail(raw, reviewsSummary);
  }
}

export const apiTrainerRepository = new ApiTrainerRepository();
