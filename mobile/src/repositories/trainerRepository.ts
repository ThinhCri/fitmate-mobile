import {
  TrainerSummaryViewModel,
  TrainerDetailViewModel,
} from '@/services/api/types';
import { apiTrainerRepository } from './api/apiTrainerRepository';

export interface ITrainerRepository {
  listTrainers(filter?: {
    specialty?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ items: TrainerSummaryViewModel[]; nextCursor?: string | null }>;
  getTrainer(id: string): Promise<TrainerDetailViewModel>;
}

export function getTrainerRepository(): ITrainerRepository {
  return apiTrainerRepository;
}
