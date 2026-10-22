import { apiClient, apiUploadFile, ApiError } from './client';
import {
  AvailabilitySlot,
  AvailabilitySlotInput,
  CertificatePage,
  GetAvailabilityParams,
  PtCertificate,
  Service,
  ServiceInput,
  ServiceUpdate,
  SetAvailabilityRequest,
  UploadFilePayload,
  UploadResponse,
  UserProfile,
  UserProfileUpdate,
} from './types';

export interface SubmitCertificateInput {
  title: string;
  issued_by: string;
  code: string;
  issue_date: string; // YYYY-MM-DD
  file: UploadFilePayload;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_CERTIFICATE_FILE_SIZE = 5 * 1024 * 1024; // 5 MiB

export const ptService = {
  async getGoogleMeetConnection(): Promise<{ connected: boolean }> {
    return apiClient<{ connected: boolean }>('/me/integrations/google-meet');
  },

  async startGoogleMeetConnection(): Promise<{ authorization_url: string }> {
    return apiClient<{ authorization_url: string }>('/me/integrations/google-meet/authorization', {
      method: 'POST',
    });
  },

  async disconnectGoogleMeet(): Promise<void> {
    return apiClient<void>('/me/integrations/google-meet', { method: 'DELETE' });
  },

  /**
   * Get list of services offered by current PT
   * Operation: listMyServices
   * Endpoint: GET /me/services?include_inactive=true
   */
  async getMyServices(includeInactive: boolean = true): Promise<Service[]> {
    const query = includeInactive ? '?include_inactive=true' : '';
    return apiClient<Service[]>('/me/services' + query);
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
    if ((input.package_4_price_vnd ?? 0) < 0 ||
        (input.package_8_price_vnd ?? 0) < 0 ||
        (input.package_4_price_vnd ?? 0) > input.price_vnd * 4 ||
        (input.package_8_price_vnd ?? 0) > input.price_vnd * 8) {
      throw new Error('Giá gói phải từ 0 đến tổng giá mua lẻ tương ứng');
    }
    if (input.duration_minutes < 15 || input.duration_minutes > 240) {
      throw new Error('Thời lượng buổi tập phải từ 15 đến 240 phút');
    }
    if (input.description.trim().length < 20) {
      throw new Error('Vui lòng mô tả buổi tập ít nhất 20 ký tự');
    }
    if (!input.target_audience.trim() || !input.required_equipment.trim() || !input.deliverable.trim()) {
      throw new Error('Vui lòng điền đối tượng phù hợp, dụng cụ và kết quả bàn giao');
    }
    if (input.delivery_mode === 'in_person' && (!input.location_name?.trim() || !input.location_address?.trim())) {
      throw new Error('Buổi tập trực tiếp cần tên và địa chỉ địa điểm cố định');
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
    if ((input.package_4_price_vnd !== undefined && input.package_4_price_vnd < 0) ||
        (input.package_8_price_vnd !== undefined && input.package_8_price_vnd < 0)) {
      throw new Error('Giá gói không được là số âm');
    }
    if (
      input.duration_minutes !== undefined &&
      (input.duration_minutes < 15 || input.duration_minutes > 240)
    ) {
      throw new Error('Thời lượng buổi tập phải từ 15 đến 240 phút');
    }
    if (input.description !== undefined && input.description.trim().length < 20) {
      throw new Error('Vui lòng mô tả buổi tập ít nhất 20 ký tự');
    }
    if (input.target_audience !== undefined && !input.target_audience.trim()) {
      throw new Error('Vui lòng nhập đối tượng phù hợp');
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
   * Set and replace availability schedule for current PT within a specific date range [from, to]
   * Operation: setMyAvailability
   * Endpoint: PUT /me/availability?from=&to=
   */
  async setMyAvailability(
    params: GetAvailabilityParams,
    slots: AvailabilitySlotInput[]
  ): Promise<void> {
    if (!params.from || !params.to) {
      throw new Error('Tham số from và to là bắt buộc');
    }
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    const payload: SetAvailabilityRequest = { slots };
    try {
      await apiClient<void>(`/me/availability?${query.toString()}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        throw new ApiError(
          'Khung giờ rảnh xung đột với lịch đã có học viên đặt hoặc đang giữ chỗ.',
          409,
          err.data
        );
      }
      if (err instanceof ApiError && err.status === 400) {
        throw new ApiError(
          err.message || 'Khung giờ rảnh bị trùng lặp hoặc nằm ngoài khoảng thời gian đã chọn.',
          400,
          err.data
        );
      }
      throw err;
    }
  },

  /**
   * Get availability slots of current PT (authoritative owner endpoint)
   * Operation: getMyAvailability
   * Endpoint: GET /me/availability?from=&to=
   */
  async getMyAvailability(
    params: GetAvailabilityParams
  ): Promise<AvailabilitySlot[]> {
    if (!params.from || !params.to) {
      throw new Error('Tham số from và to là bắt buộc');
    }
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    return apiClient<AvailabilitySlot[]>('/me/availability?' + query.toString());
  },

  /**
   * Get availability slots of a trainer (public/member booking view)
   * Operation: getTrainerAvailability
   * Endpoint: GET /trainers/{id}/availability?from=&to=
   */
  async getTrainerAvailability(
    trainerId: string,
    params: GetAvailabilityParams
  ): Promise<AvailabilitySlot[]> {
    if (!params.from || !params.to) {
      throw new Error('Tham số from và to là bắt buộc');
    }
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    return apiClient<AvailabilitySlot[]>(
      '/trainers/' + encodeURIComponent(trainerId) + '/availability?' + query.toString()
    );
  },

  /**
   * Get list of certificates submitted by current PT (paginated)
   * Operation: listMyCertificates
   * Endpoint: GET /me/certificates?page=1&pageSize=25
   */
  async getMyCertificates(
    page: number = 1,
    pageSize: number = 25
  ): Promise<CertificatePage> {
    const query = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    return apiClient<CertificatePage>('/me/certificates?' + query.toString());
  },

  /**
   * Step 1: Upload certificate image file to /uploads
   * Client-side validation: MIME (image/jpeg, image/png, image/webp), max 5 MiB, no PDF
   */
  async uploadCertificateFile(file: UploadFilePayload): Promise<UploadResponse> {
    const fileName = (file.name || '').toLowerCase();
    const isPdf =
      file.type === 'application/pdf' || fileName.endsWith('.pdf');
    if (isPdf) {
      throw new Error(
        'Chỉ chấp nhận tệp hình ảnh (JPEG, PNG, WebP) có dung lượng tối đa 5MB. Định dạng PDF không được hỗ trợ.'
      );
    }

    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
    if (!hasValidExt && !hasValidMime) {
      throw new Error(
        'Định dạng tệp không hợp lệ. Vui lòng chọn tệp ảnh JPEG, PNG hoặc WebP.'
      );
    }

    if (file.size && file.size > MAX_CERTIFICATE_FILE_SIZE) {
      throw new Error(
        'Dung lượng tệp vượt quá 5MB. Vui lòng chọn tệp hình ảnh nhỏ hơn.'
      );
    }

    try {
      return await apiUploadFile<UploadResponse>(
        '/uploads',
        file.uri,
        file.type || 'image/jpeg',
        { category: 'certificates' }
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 413) {
        throw new ApiError(
          'Dung lượng tệp vượt quá giới hạn tối đa 5MB của máy chủ.',
          413,
          err.data
        );
      }
      throw err;
    }
  },

  /**
   * Submit a new certificate for verification (2-step contract)
   * Step 1: POST /uploads (multipart) -> returns UploadResponse
   * Step 2: POST /me/certificates (multipart/form-data with image_storage_key)
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
      throw new Error('Vui lòng đính kèm tệp ảnh chứng chỉ');
    }

    // Step 1: Upload file to storage
    const uploadRes = await this.uploadCertificateFile(input.file);

    // Step 2: Submit certificate metadata with image_storage_key
    const certFormData = new FormData();
    certFormData.append('title', input.title.trim());
    certFormData.append('issued_by', input.issued_by.trim());
    certFormData.append('code', input.code.trim());
    certFormData.append('issue_date', input.issue_date.trim());
    if (uploadRes.storageKey) {
      certFormData.append('image_storage_key', uploadRes.storageKey);
    }

    return apiClient<PtCertificate>('/me/certificates', {
      method: 'POST',
      body: certFormData,
    });
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
