import { apiClient } from './client';
import {
  PaginatedResponse,
  TrainerFilterParams,
  TrainerPublicDetail,
  TrainerPublicSummary,
} from './types';

export const trainersService = {
  async listTrainers(
    params: TrainerFilterParams = {}
  ): Promise<PaginatedResponse<TrainerPublicSummary>> {
    const query = new URLSearchParams();
    if (params.specialty) query.append('specialty', params.specialty);
    if (params.minPriceVnd !== undefined)
      query.append('minPriceVnd', params.minPriceVnd.toString());
    if (params.maxPriceVnd !== undefined)
      query.append('maxPriceVnd', params.maxPriceVnd.toString());
    if (params.minRating !== undefined)
      query.append('minRating', params.minRating.toString());
    if (params.cursor) query.append('cursor', params.cursor);
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const endpoint = `/api/v1/trainers${queryString ? `?${queryString}` : ''}`;
    return apiClient<PaginatedResponse<TrainerPublicSummary>>(endpoint);
  },

  async getTrainer(id: string): Promise<TrainerPublicDetail> {
    return apiClient<TrainerPublicDetail>(`/api/v1/trainers/${encodeURIComponent(id)}`);
  },

  async getTrainerAvailability(
    id: string
  ): Promise<{ availableDays: string[]; timeSlots: string[] }> {
    return apiClient<{ availableDays: string[]; timeSlots: string[] }>(
      `/api/v1/trainers/${encodeURIComponent(id)}/availability`
    );
  },
};
