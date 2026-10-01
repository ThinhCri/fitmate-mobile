import {
  TrainerSummaryViewModel,
  TrainerDetailViewModel,
} from '@/services/api/types';
import { getDataSourceMode } from './repositoryTypes';
import { apiTrainerRepository } from './api/apiTrainerRepository';
import { previewTrainerRepository } from './preview/previewTrainerRepository';

export interface ITrainerRepository {
  listTrainers(filter?: {
    specialty?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ items: TrainerSummaryViewModel[]; nextCursor?: string | null }>;
  getTrainer(id: string): Promise<TrainerDetailViewModel>;
}

export function getTrainerRepository(): ITrainerRepository {
  const mode = getDataSourceMode();
  if (mode === 'preview') {
    return previewTrainerRepository;
  }
  return apiTrainerRepository;
}
