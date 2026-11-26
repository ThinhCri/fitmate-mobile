import { apiClient } from './client';
import { authService } from './authService';
import { bookingService } from './bookingService';
import { getTrainerRepository } from '@/repositories/trainerRepository';
import { ptService } from './ptService';
import { resolveOptionalApiResourceUrl } from './resourceUrl';
import { ApiError } from './client';
import type { PtRevenueBookingItemViewModel } from '@/features/pt/PtRevenuePresentation';
import { mapSettlementStatus } from './settlementStatus';

interface RevenueOverview { refund_adjustment_vnd?: number; range: string; total_gross_vnd: number; platform_fee_vnd: number; net_earnings_vnd: number; pending_payout_vnd: number; completed_payout_vnd: number; }
export interface RevenueItem { appointment_id: string; date: string; gross_vnd: number; platform_fee_vnd: number; net_vnd: number; paid_out_vnd: number; settlement_status: string; transferred_at_utc: string | null; bank_reference: string | null; payee_bank_name: string | null; payee_account_number_masked: string | null; payee_account_name: string | null; }
interface RevenuePage { items: RevenueItem[]; total: number; page: number; pageSize: number }
export interface PtPayoutAccount { bank_code: string; bank_name: string; account_number: string; masked_account_number: string; account_name: string; verified_at_utc: string; }

export const ptDashboardService = {
  async getOverview() {
    const me = await authService.getMe();
    const [services, bookings, pending, certificates, publicProfile] = await Promise.all([
      ptService.getMyServices(true),
      bookingService.listMyTrainerBookings({ status: 'Confirmed', page: 1, pageSize: 20 }),
      bookingService.listMyTrainerBookings({ status: 'Pending', page: 1, pageSize: 1 }),
      ptService.getMyCertificates(1, 25),
      getTrainerRepository().getTrainer(me.id).catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }),
    ]);
    const upcoming = bookings.items.filter((item) => new Date(item.slot_start_utc).getTime() >= Date.now()).map((item) => ({ id: item.id, clientName: `Mã hội viên ${item.member_id.slice(0, 8)}`, serviceName: services.find((service) => service.id === item.service_id)?.name || 'Dịch vụ chưa có tên', timeString: new Date(item.slot_start_utc).toLocaleString('vi-VN'), location: services.find((service) => service.id === item.service_id)?.location_name || '' }));
    const pendingTasks: { id: string; title: string; type: 'warning' | 'info'; linkTarget: string }[] = [];
    if (pending.total > 0) pendingTasks.push({ id: 'pending-bookings', title: `${pending.total} lịch hẹn chờ phản hồi`, type: 'warning', linkTarget: '/pt/sessions?status=Pending' });
    if (!services.some((service) => service.is_active)) pendingTasks.push({ id: 'services', title: 'Chưa có dịch vụ đang mở — quản lý dịch vụ', type: 'info', linkTarget: '/pt/profile-services' });
    const certificate = certificates.items.find((item) => item.status === 'approved');
    return { ptName: me.full_name, avatarUrl: resolveOptionalApiResourceUrl(publicProfile?.avatarUrl ?? me.avatar_url), isVerified: publicProfile?.isVerified === true, certificateName: certificate?.title || (publicProfile?.isVerified ? 'Hồ sơ PT đã được xác minh' : 'Chưa xác nhận được trạng thái kiểm định'), rating: publicProfile?.rating ?? null, reviewCount: publicProfile?.reviewCount ?? null, isAcceptingClients: services.some((service) => service.is_active), pendingTasks, upcomingSessions: upcoming };
  },
  async getRevenue(range = '30d', page = 1) {
    const [overview, history] = await Promise.all([
      apiClient<RevenueOverview>(`/me/revenue?range=${range}`),
      apiClient<RevenuePage>(`/me/revenue/history?page=${page}&pageSize=20`),
    ]);
    const bookings: PtRevenueBookingItemViewModel[] = history.items.map((item) => ({ bookingId: item.appointment_id, bookingCode: `BK-${item.appointment_id.slice(0, 8).toUpperCase()}`, clientName: 'Chi tiết học viên trong hồ sơ buổi tập', serviceName: 'Khoản ghi nhận theo buổi tập', completedDate: new Date(item.date).toLocaleString('vi-VN'), grossAmountVnd: item.gross_vnd, platformFeeVnd: item.platform_fee_vnd, ptShareVnd: item.net_vnd, payoutStatus: mapSettlementStatus(item.settlement_status) }));
    return { overview, bookings, items: history.items, historyPage: history.page, historyTotal: history.total, historyPageSize: history.pageSize };
  },
  async getRevenueItem(appointmentId: string) {
    for (let page = 1; page <= 100; page++) {
      const history = await apiClient<RevenuePage>(`/me/revenue/history?page=${page}&pageSize=100`);
      const item = history.items.find((entry) => entry.appointment_id === appointmentId);
      if (item) return item;
      if (history.page * history.pageSize >= history.total) throw new Error('Không tìm thấy khoản chi của buổi tập này.');
      if (!history.items.length) throw new Error('Lịch sử doanh thu từ máy chủ chưa nhất quán. Vui lòng tải lại.');
    }
    throw new Error('Lịch sử doanh thu quá lớn để tra cứu tự động. Vui lòng liên hệ hỗ trợ với mã buổi tập.');
  },
  async getPayoutAccount(): Promise<PtPayoutAccount | null> {
    const value = await apiClient<PtPayoutAccount | Record<string, never>>('/me/payout-account');
    return value && 'bank_code' in value ? value as PtPayoutAccount : null;
  },
  savePayoutAccount(bankBin: string, bankName: string, accountNumber: string) {
    return apiClient<PtPayoutAccount>('/me/payout-account', { method: 'PUT', body: JSON.stringify({ bank_bin: bankBin, bank_name: bankName, account_number: accountNumber }) });
  },
};
