import { apiClient, ApiError } from './client';
import {
  AvailabilitySlot,
  AvailabilitySlotInput,
  GetAvailabilityParams,
  PtCertificate,
  Service,
  ServiceInput,
  ServiceUpdate,
  SetAvailabilityRequest,
  UserProfile,
  UserProfileUpdate,
} from './types';

export interface SubmitCertificateInput {
  title: string;
  issued_by: string;
  code: string;
  issue_date: string; // YYYY-MM-DD
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

export const ptService = {
  /**
   * Get list of services offered by current PT
   * Operation: listMyServices
   * Endpoint: GET /me/services
   */
  async getMyServices(): Promise<Service[]> {
    return apiClient<Service[]>('/me/services');
  },

  /**
   * Create a new service package
   * Operation: createService
   * Endpoint: POST /me/services
   */
  async createService(input: ServiceInput): Promise<Service> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Tên gói dịch vụ không được để trống');
    }
    if (input.price_vnd < 0) {
      throw new Error('Giá dịch vụ không được là số âm');
    }
    if (input.duration_minutes < 15 || input.duration_minutes > 240) {
      throw new Error('Thời lượng buổi tập phải từ 15 đến 240 phút');
    }

    return apiClient<Service>('/me/services', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update an existing service package
   * Operation: updateService
   * Endpoint: PATCH /me/services/{id}
   */
  async updateService(id: string, input: ServiceUpdate): Promise<Service> {
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error('Tên gói dịch vụ không được để trống');
    }
    if (input.price_vnd !== undefined && input.price_vnd < 0) {
      throw new Error('Giá dịch vụ không được là số âm');
    }
    if (
      input.duration_minutes !== undefined &&
      (input.duration_minutes < 15 || input.duration_minutes > 240)
    ) {
      throw new Error('Thời lượng buổi tập phải từ 15 đến 240 phút');
    }

    try {
      return await apiClient<Service>('/me/services/' + encodeURIComponent(id), {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        throw new ApiError(
          'Không thể chỉnh sửa dịch vụ này vì đang có học viên đặt lịch chờ thực hiện.',
          409,
          err.data
        );
      }
      throw err;
    }
  },

  /**
   * Delete a service package (soft delete if historical bookings exist)
   * Operation: deleteService
   * Endpoint: DELETE /me/services/{id}
   */
  async deleteService(id: string): Promise<void> {
    try {
      await apiClient<void>('/me/services/' + encodeURIComponent(id), {
        method: 'DELETE',
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        throw new ApiError(
          'Không thể xóa gói dịch vụ này vì đang có học viên đặt lịch chờ hoàn thành.',
          409,
          err.data
        );
      }
      throw err;
    }
  },

  /**
   * Set and replace entire availability schedule for current PT
   * Operation: setMyAvailability
   * Endpoint: PUT /me/availability
   */
  async setMyAvailability(slots: AvailabilitySlotInput[]): Promise<void> {
    const payload: SetAvailabilityRequest = { slots };
    try {
      await apiClient<void>('/me/availability', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        throw new ApiError(
          err.message || 'Khung giờ rảnh bị trùng lặp hoặc không hợp lệ.',
          400,
          err.data
        );
      }
      throw err;
    }
  },

  /**
   * Get availability slots of PT
   * Operation: getTrainerAvailability
   * Endpoint: GET /trainers/{id}/availability
   */
  async getMyAvailability(
    trainerId: string,
    params: GetAvailabilityParams
  ): Promise<AvailabilitySlot[]> {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    return apiClient<AvailabilitySlot[]>(
      '/trainers/' + encodeURIComponent(trainerId) + '/availability?' + query.toString()
    );
  },

  /**
   * Get list of certificates submitted by current PT
   * Operation: listMyCertificates
   * Endpoint: GET /me/certificates
   */
  async getMyCertificates(): Promise<PtCertificate[]> {
    return apiClient<PtCertificate[]>('/me/certificates');
  },

  /**
   * Submit a new certificate for verification
   * Operation: submitCertificate
   * Endpoint: POST /me/certificates (multipart/form-data)
   */
  async submitCertificate(input: SubmitCertificateInput): Promise<PtCertificate> {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Vui lòng nhập tên chứng chỉ');
    }
    if (!input.issued_by || input.issued_by.trim().length === 0) {
      throw new Error('Vui lòng nhập đơn vị cấp chứng chỉ');
    }
    if (!input.code || input.code.trim().length === 0) {
      throw new Error('Vui lòng nhập mã chứng nhận');
    }
    if (!input.issue_date || input.issue_date.trim().length === 0) {
      throw new Error('Vui lòng chọn ngày cấp chứng chỉ');
    }
    if (!input.file || !input.file.uri) {
      throw new Error('Vui lòng đính kèm tệp chứng chỉ (ảnh hoặc PDF)');
    }

    const formData = new FormData();
    formData.append('title', input.title.trim());
    formData.append('issued_by', input.issued_by.trim());
    formData.append('code', input.code.trim());
    formData.append('issue_date', input.issue_date.trim());

    // In React Native / Expo, file upload FormData requires an object with uri, name, type
    // In Node / browser tests, File or Blob can be passed
    const fileObj: any = {
      uri: input.file.uri,
      name: input.file.name || 'certificate.jpg',
      type: input.file.type || 'image/jpeg',
    };
    formData.append('file', fileObj);

    try {
      return await apiClient<PtCertificate>('/me/certificates', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 413) {
        throw new ApiError(
          'Dung lượng tệp chứng chỉ vượt quá giới hạn cho phép (tối đa 15MB).',
          413,
          err.data
        );
      }
      throw err;
    }
  },

  /**
   * Update profile fields for current user
   * Operation: updateMe
   * Endpoint: PATCH /users/me
   */
  async updateMyProfile(data: UserProfileUpdate): Promise<UserProfile> {
    return apiClient<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
