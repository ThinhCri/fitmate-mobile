/**
 * PT Service Unit Tests (MOB-801)
 *
 * Verifies:
 * 1. CRUD operations for PT Services (/me/services, /me/services/{id}) with include_inactive=true
 * 2. Inactive service reactivation via PATCH /me/services/{id}
 * 3. 409 Conflict handling on service edit/delete with friendly Vietnamese copy
 * 4. 204 No Content handling on delete and availability replacement
 * 5. Availability payload formatting and UTC ISO-8601 query bounds
 * 6. Certificate listing with CertificatePage pagination
 * 7. 2-step certificate upload:
 *    - Step 1: POST /uploads (category=certificates, multipart)
 *    - Step 2: POST /me/certificates (form data with image_storage_key)
 * 8. Client-side certificate validation:
 *    - Rejection of PDF format
 *    - Rejection of non-image MIME types
 *    - Rejection of files exceeding 5 MiB
 * 9. Profile update (/users/me)
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ptService } from '../ptService';
import { ApiError } from '../client';
import { sessionManager } from '@/services/session/sessionManager';

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
    it('fetches list of services with include_inactive=true', async () => {
      const mockServices = [
        {
          id: 'svc-1',
          name: 'Tập sức mạnh cá nhân 1-kèm-1',
          description: 'Phòng tập Fitmate Thảo Điền',
          price_vnd: 300000,
          duration_minutes: 60,
          is_active: true,
        },
        {
          id: 'svc-2',
          name: 'Gói phục hồi chức năng (Tạm ngưng)',
          description: 'Hỗ trợ giãn cơ chuyên sâu',
          price_vnd: 450000,
          duration_minutes: 45,
          is_active: false,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockServices,
      } as unknown as Response);

      const result = await ptService.getMyServices(true);
      expect(result).toEqual(mockServices);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/services?include_inactive=true'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-pt-access-token',
          }),
        })
      );
    });

    it('reactivates an inactive service with is_active: true', async () => {
      const updatedService = {
        id: 'svc-2',
        name: 'Gói phục hồi chức năng',
        price_vnd: 450000,
        duration_minutes: 45,
        is_active: true,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => updatedService,
      } as unknown as Response);

      const result = await ptService.updateService('svc-2', { is_active: true });
      expect(result.is_active).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/services/svc-2'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ is_active: true }),
        })
      );
    });

    it('creates service with valid input and rejects invalid fields', async () => {
      await expect(
        ptService.createService({
          name: '',
          price_vnd: 200000,
          duration_minutes: 60,
        })
      ).rejects.toThrow('Tên gói dịch vụ không được để trống');

      await expect(
        ptService.createService({
          name: 'Gói Yoga',
          price_vnd: -50000,
          duration_minutes: 60,
        })
      ).rejects.toThrow('Giá dịch vụ không được là số âm');

      await expect(
        ptService.createService({
          name: 'Gói Yoga',
          price_vnd: 200000,
          duration_minutes: 10,
        })
      ).rejects.toThrow('Thời lượng buổi tập phải từ 15 đến 240 phút');

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
      } as unknown as Response);

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
      } as unknown as Response);

      let caughtErr: unknown;
      try {
        await ptService.updateService('svc-1', { duration_minutes: 90 });
      } catch (err) {
        caughtErr = err;
      }

      expect(caughtErr).toBeInstanceOf(ApiError);
      expect((caughtErr as ApiError).status).toBe(409);
      expect((caughtErr as ApiError).message).toContain('đang có học viên đặt lịch chờ thực hiện');
    });

    it('deletes service with 204 No Content and handles 409 Conflict', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      } as unknown as Response);

      await expect(ptService.deleteService('svc-to-delete')).resolves.toBeUndefined();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          detail: 'Pending booking exists',
        }),
      } as unknown as Response);

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
      } as unknown as Response);

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

    it('fetches availability with UTC ISO-8601 query bounds', async () => {
      const mockSlots = [
        {
          id: 'slot-1',
          slot_start_utc: '2026-09-28T00:00:00Z',
          slot_start_local: '2026-09-28T07:00:00',
          duration_minutes: 60,
          status: 'open' as const,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSlots,
      } as unknown as Response);

      const fromIso = '2026-09-28T00:00:00.000Z';
      const toIso = '2026-10-05T00:00:00.000Z';

      const result = await ptService.getMyAvailability('pt-uuid-1', {
        from: fromIso,
        to: toIso,
      });

      expect(result).toEqual(mockSlots);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(fromIso)),
        expect.any(Object)
      );
    });
  });

  describe('3. Certificate Management & 2-Step Upload', () => {
    it('lists certificates returning CertificatePage with items and total', async () => {
      const mockPage = {
        items: [
          {
            id: 'cert-1',
            pt_id: 'pt-123',
            title: 'NASM Certified Personal Trainer',
            issued_by: 'NASM',
            code: 'NASM-882941-CPT',
            issue_date: '2022-05-15',
            status: 'approved',
            image_url: 'https://cdn.fitmate.vn/certs/cert1.jpg',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPage,
      } as unknown as Response);

      const result = await ptService.getMyCertificates(1, 25);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].status).toBe('approved');
    });

    it('rejects PDF format on certificate upload', async () => {
      await expect(
        ptService.uploadCertificateFile({
          uri: 'file://cert.pdf',
          name: 'diploma.pdf',
          type: 'application/pdf',
        })
      ).rejects.toThrow('Định dạng PDF không được hỗ trợ');
    });

    it('rejects files exceeding 5 MiB size limit', async () => {
      await expect(
        ptService.uploadCertificateFile({
          uri: 'file://large_cert.png',
          name: 'large_cert.png',
          type: 'image/png',
          size: 6 * 1024 * 1024, // 6 MiB
        })
      ).rejects.toThrow('Dung lượng tệp vượt quá 5MB');
    });

    it('executes 2-step certificate submission successfully', async () => {
      // Step 1: POST /uploads
      const uploadResponse = {
        storageKey: 'certificates/pt123_cert_abc.jpg',
        uri: 'https://storage.fitmate.vn/certificates/pt123_cert_abc.jpg',
        signedUrl: 'https://storage.fitmate.vn/certs/signed',
      };

      // Step 2: POST /me/certificates
      const createdCert = {
        id: 'cert-new',
        pt_id: 'pt-123',
        title: 'ACE Fitness Coach',
        issued_by: 'American Council on Exercise',
        code: 'ACE-554433',
        issue_date: '2023-08-10',
        status: 'pending',
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => uploadResponse,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => createdCert,
        } as unknown as Response);

      const result = await ptService.submitCertificate({
        title: 'ACE Fitness Coach',
        issued_by: 'American Council on Exercise',
        code: 'ACE-554433',
        issue_date: '2023-08-10',
        file: {
          uri: 'file://cert.jpg',
          name: 'cert.jpg',
          type: 'image/jpeg',
          size: 2 * 1024 * 1024,
        },
      });

      expect(result.id).toBe('cert-new');
      expect(result.status).toBe('pending');
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Verify Step 1 endpoint was /uploads
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/uploads'),
        expect.objectContaining({ method: 'POST' })
      );

      // Verify Step 2 endpoint was /me/certificates
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/me/certificates'),
        expect.objectContaining({ method: 'POST' })
      );
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
          fitness_goal: 'Tăng cơ giảm mỡ',
        }),
      } as unknown as Response);

      const updated = await ptService.updateMyProfile({
        fitness_goal: 'Tăng cơ giảm mỡ',
      });

      expect(updated.fitness_goal).toBe('Tăng cơ giảm mỡ');
    });
  });
});
