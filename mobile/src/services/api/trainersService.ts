import { apiClient } from './client';
import {
  AvailabilitySlot,
  GetAvailabilityParams,
  ListTrainersResponse,
  PTPublicDetail,
  TrainerFilterParams,
  TrainerReviewsSummaryResponse,
} from './types';

export const trainersService = {
  /**
   * List trainers with server-side filtering and cursor pagination
   * Operation: listTrainers
   * Endpoint: GET /trainers (base URL already includes /api/v1)
   */
  async listTrainers(
    params: TrainerFilterParams = {}
  ): Promise<ListTrainersResponse> {
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
    const endpoint = '/trainers' + (queryString ? '?' + queryString : '');
    return apiClient<ListTrainersResponse>(endpoint);
  },

  /**
   * Get public trainer detail by UUID (verified only)
   * Operation: getTrainer
   * Endpoint: GET /trainers/{id}
   */
  async getTrainer(id: string): Promise<PTPublicDetail> {
    return apiClient<PTPublicDetail>('/trainers/' + encodeURIComponent(id));
  },

  async getTrainerReviews(id: string, limit = 50): Promise<TrainerReviewsSummaryResponse> {
    return apiClient<TrainerReviewsSummaryResponse>(
      `/trainers/${encodeURIComponent(id)}/reviews?limit=${encodeURIComponent(String(limit))}`
    );
  },

  /**
   * Get trainer availability slots
   * Operation: getTrainerAvailability
   * Endpoint: GET /trainers/{id}/availability?from=...&to=...
   * Note: 'from' and 'to' are required in OpenAPI contract
   */
  async getTrainerAvailability(
    id: string,
    params: GetAvailabilityParams
  ): Promise<AvailabilitySlot[]> {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    return apiClient<AvailabilitySlot[]>(
      '/trainers/' + encodeURIComponent(id) + '/availability?' + query.toString()
    );
  },
};
