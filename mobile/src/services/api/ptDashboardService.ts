import { apiClient } from './client';
import { authService } from './authService';
import { bookingService } from './bookingService';
import { getTrainerRepository } from '@/repositories/trainerRepository';
import { ptService } from './ptService';
import { ApiError } from './client';
import type { PtRevenueBookingItemViewModel } from '@/features/pt/PtRevenuePresentation';

interface RevenueOverview { range: string; total_gross_vnd: number; platform_fee_vnd: number; net_earnings_vnd: number; pending_payout_vnd: number; completed_payout_vnd: number; }
export interface RevenueItem { appointment_id: string; date: string; gross_vnd: number; platform_fee_vnd: number; net_vnd: number; paid_out_vnd: number; settlement_status: string; transferred_at_utc: string | null; bank_reference: string | null; payee_bank_name: string | null; payee_account_number_masked: string | null; payee_account_name: string | null; }
interface RevenuePage { items: RevenueItem[] }
export interface PtPayoutAccount { bank_code: string; bank_name: string; account_number: string; masked_account_number: string; account_name: string; verified_at_utc: string; }

export const ptDashboardService = {
  async getOverview() {
    const me = await authService.getMe();
    const [services, bookings, publicProfile] = await Promise.all([
      ptService.getMyServices(true),
      bookingService.listMyTrainerBookings({ page: 1, pageSize: 20 }),
      getTrainerRepository().getTrainer(me.id).catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }),
    ]);
    const upcoming = bookings.items.filter((item) => ['Confirmed', 'InProgress', 'AwaitingMemberConfirmation'].includes(item.status)).map((item) => ({ id: item.id, clientName: `Hội viên ${item.member_id.slice(0, 8)}`, serviceName: services.find((service) => service.id === item.service_id)?.name || 'Buổi huấn luyện', timeString: new Date(item.slot_start_utc).toLocaleString('vi-VN'), location: '' }));
    return { ptName: me.full_name, isVerified: true, certificateName: 'Chứng chỉ đã xác minh', rating: publicProfile?.rating ?? null, reviewCount: publicProfile?.reviewCount ?? null, isAcceptingClients: services.some((service) => service.is_active), pendingTasks: [], upcomingSessions: upcoming };
  },
  async getRevenue(range = '30d') {
    const [overview, history] = await Promise.all([
      apiClient<RevenueOverview>(`/me/revenue?range=${range}`),
      apiClient<RevenuePage>(`/me/revenue/history?page=1&pageSize=50`),
    ]);
    const bookings: PtRevenueBookingItemViewModel[] = (history.items || []).map((item) => ({ bookingId: item.appointment_id, bookingCode: `BK-${item.appointment_id.slice(0, 8).toUpperCase()}`, clientName: 'Hội viên', serviceName: 'Buổi huấn luyện', completedDate: new Date(item.date).toLocaleString('vi-VN'), grossAmountVnd: item.gross_vnd, platformFeeVnd: item.platform_fee_vnd, ptShareVnd: item.net_vnd, payoutStatus: item.settlement_status.toLowerCase().includes('paid') ? 'paid_out' : item.settlement_status.toLowerCase().includes('hold') ? 'on_hold' : item.paid_out_vnd > 0 ? 'approved' : 'pending' }));
    return { overview, bookings, items: history.items || [] };
  },
  async getRevenueItem(appointmentId: string) {
    const history = await apiClient<RevenuePage>('/me/revenue/history?page=1&pageSize=100');
    const item = history.items.find((entry) => entry.appointment_id === appointmentId);
    if (!item) throw new Error('Không tìm thấy khoản chi của buổi tập này.');
    return item;
  },
  async getPayoutAccount(): Promise<PtPayoutAccount | null> {
    const value = await apiClient<PtPayoutAccount | Record<string, never>>('/me/payout-account');
    return value && 'bank_code' in value ? value as PtPayoutAccount : null;
  },
  savePayoutAccount(bankBin: string, bankName: string, accountNumber: string) {
    return apiClient<PtPayoutAccount>('/me/payout-account', { method: 'PUT', body: JSON.stringify({ bank_bin: bankBin, bank_name: bankName, account_number: accountNumber }) });
  },
};
