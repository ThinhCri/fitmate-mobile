/**
 * PT Service Unit Tests (MOB-801)
 *
 * Verifies:
 * 1. CRUD operations for PT Services (/me/services, /me/services/{id})
 * 2. 409 Conflict handling on service edit/delete with friendly Vietnamese copy
 * 3. 204 No Content handling on delete and availability replacement
 * 4. Availability payload formatting (/me/availability)
 * 5. Certificate listing and multipart submission (/me/certificates)
 * 6. 413 Payload Too Large handling on certificate upload
 * 7. Profile update (/users/me)
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const secureStoreMock = new Map<string, string>();

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key: string) => secureStoreMock.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, val: string) => {
    secureStoreMock.set(key, val);
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    secureStoreMock.delete(key);
  }),
}));

import { ptService } from '../ptService';
import { ApiError } from '../client';
import { sessionManager } from '@/services/session/sessionManager';

describe('ptService (MOB-801)', () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    sessionManager.setAccessToken('valid-pt-access-token');
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Services Management (/me/services)', () => {
    it('fetches list of services', async () => {
      const mockServices = [
        {
          id: 'svc-1',
          name: 'Tập sức mạnh cá nhân 1-kèm-1',
          description: 'Phòng tập Fitmate Thảo Điền',
          price_vnd: 300000,
          duration_minutes: 60,
          is_active: true,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockServices,
      } as any);

      const result = await ptService.getMyServices();
      expect(result).toEqual(mockServices);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/services'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-pt-access-token',
          }),
        })
      );
    });

    it('creates service with valid input and rejects invalid fields', async () => {
      // Rejects empty name
      await expect(
        ptService.createService({
          name: '',
          price_vnd: 200000,
          duration_minutes: 60,
        })
      ).rejects.toThrow('Tên gói dịch vụ không được để trống');

      // Rejects negative price
      await expect(
        ptService.createService({
          name: 'Gói Yoga',
          price_vnd: -50000,
          duration_minutes: 60,
        })
      ).rejects.toThrow('Giá dịch vụ không được là số âm');

      // Rejects duration < 15 min
      await expect(
        ptService.createService({
          name: 'Gói Yoga',
          price_vnd: 200000,
          duration_minutes: 10,
        })
      ).rejects.toThrow('Thời lượng buổi tập phải từ 15 đến 240 phút');

      // Valid creation succeeds
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          id: 'svc-new',
          name: 'Gói Pilates',
          price_vnd: 350000,
          duration_minutes: 60,
          is_active: true,
        }),
      } as any);

      const created = await ptService.createService({
        name: 'Gói Pilates',
        price_vnd: 350000,
        duration_minutes: 60,
      });

      expect(created.id).toBe('svc-new');
      expect(created.name).toBe('Gói Pilates');
    });

    it('updates service and handles 409 Conflict with friendly copy', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          title: 'Conflict',
          detail: 'Cannot modify service with active bookings',
        }),
      } as any);

      let caughtErr: any;
      try {
        await ptService.updateService('svc-1', { duration_minutes: 90 });
      } catch (err) {
        caughtErr = err;
      }

      expect(caughtErr).toBeInstanceOf(ApiError);
      expect(caughtErr.status).toBe(409);
      expect(caughtErr.message).toContain('đang có học viên đặt lịch chờ thực hiện');
    });

    it('deletes service with 204 No Content and handles 409 Conflict', async () => {
      // 204 No Content
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      } as any);

      await expect(ptService.deleteService('svc-to-delete')).resolves.toBeUndefined();

      // 409 Conflict
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          detail: 'Pending booking exists',
        }),
      } as any);

      await expect(ptService.deleteService('svc-locked')).rejects.toThrow(
        'Không thể xóa gói dịch vụ này vì đang có học viên đặt lịch chờ hoàn thành.'
      );
    });
  });

  describe('2. Availability Management (/me/availability)', () => {
    it('sets and replaces availability with 204 No Content', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      } as any);

      const slots = [
        {
          slot_start_local: '2026-09-28T07:00:00',
          duration_minutes: 120,
        },
        {
          slot_start_local: '2026-09-28T19:15:00',
          duration_minutes: 60,
        },
      ];

      await expect(ptService.setMyAvailability(slots)).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/availability'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ slots }),
        })
      );
    });

    it('handles 400 validation error on overlapping availability slots', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          title: 'Validation Error',
          detail: 'Khung giờ bị trùng lặp với lịch hẹn đã có',
        }),
      } as any);

      await expect(
        ptService.setMyAvailability([
          { slot_start_local: '2026-09-28T07:00:00', duration_minutes: 60 },
          { slot_start_local: '2026-09-28T07:30:00', duration_minutes: 60 },
        ])
      ).rejects.toThrow('Khung giờ bị trùng lặp với lịch hẹn đã có');
    });
  });

  describe('3. Certificates Management (/me/certificates)', () => {
    it('lists certificates for current PT', async () => {
      const mockCerts = [
        {
          id: 'cert-1',
          pt_id: 'pt-123',
          title: 'NASM Certified Personal Trainer',
          issued_by: 'National Academy of Sports Medicine',
          code: 'NASM-882941-CPT',
          issue_date: '2022-05-15',
          status: 'approved',
          image_url: 'https://cdn.fitmate.vn/certs/cert1.jpg',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCerts,
      } as any);

      const result = await ptService.getMyCertificates();
      expect(result).toEqual(mockCerts);
      expect(result[0].status).toBe('approved');
    });

    it('submits certificate via multipart/form-data and handles 413 Payload Too Large', async () => {
      // Missing fields rejected locally
      await expect(
        ptService.submitCertificate({
          title: '',
          issued_by: 'NASM',
          code: '123',
          issue_date: '2023-01-01',
          file: { uri: 'file://cert.jpg', name: 'cert.jpg', type: 'image/jpeg' },
        })
      ).rejects.toThrow('Vui lòng nhập tên chứng chỉ');

      // 413 Payload Too Large
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 413,
        json: async () => ({
          title: 'Payload Too Large',
        }),
      } as any);

      await expect(
        ptService.submitCertificate({
          title: 'CPR First Aid',
          issued_by: 'Red Cross',
          code: 'CPR-999',
          issue_date: '2024-01-01',
          file: { uri: 'file://huge_cert.pdf', name: 'huge_cert.pdf', type: 'application/pdf' },
        })
      ).rejects.toThrow('Dung lượng tệp chứng chỉ vượt quá giới hạn cho phép (tối đa 15MB)');
    });
  });

  describe('4. Profile Update (/users/me)', () => {
    it('updates profile fields on server', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'usr-pt-1',
          email: 'pt@fitmate.vn',
          full_name: 'HLV Trần Quang Huy',
          fitness_goal: 'Triết lý tập luyện cá nhân hóa',
        }),
      } as any);

      const updated = await ptService.updateMyProfile({
        fitness_goal: 'Triết lý tập luyện cá nhân hóa',
      });

      expect(updated.fitness_goal).toBe('Triết lý tập luyện cá nhân hóa');
    });
  });
});
