import { apiClient } from './client';
import { authService } from './authService';
import { bookingService } from './bookingService';
import { getTrainerRepository } from '@/repositories/trainerRepository';
import type { PtRevenueBookingItemViewModel } from '@/features/pt/PtRevenuePresentation';

interface RevenueOverview { range: string; total_gross_vnd: number; platform_fee_vnd: number; net_earnings_vnd: number; pending_payout_vnd: number; completed_payout_vnd: number; }
interface RevenuePage { items: Array<{ appointment_id: string; date: string; gross_vnd: number; platform_fee_vnd: number; net_vnd: number; paid_out_vnd: number; settlement_status: string }> }

export const ptDashboardService = {
  async getOverview() {
    const me = await authService.getMe();
    const [publicProfile, bookings] = await Promise.all([
      getTrainerRepository().getTrainer(me.id),
      bookingService.listMyTrainerBookings({ page: 1, pageSize: 20 }),
    ]);
    const upcoming = bookings.items.filter((item) => ['Held', 'Pending', 'Confirmed'].includes(item.status)).map((item) => ({ id: item.id, clientName: `Hội viên ${item.member_id.slice(0, 8)}`, serviceName: `Dịch vụ ${item.service_id.slice(0, 8)}`, timeString: new Date(item.slot_start_utc).toLocaleString('vi-VN'), location: 'Theo thông tin lịch hẹn' }));
    return { ptName: publicProfile.name, isVerified: publicProfile.isVerified, certificateName: publicProfile.isVerified ? 'Chứng chỉ đã xác minh' : 'Chứng chỉ chưa xác minh', rating: publicProfile.rating, reviewCount: publicProfile.reviewCount, isAcceptingClients: publicProfile.services.some((service) => service.isActive), pendingTasks: [], upcomingSessions: upcoming };
  },
  async getRevenue(range = '30d') {
    const [overview, history] = await Promise.all([
      apiClient<RevenueOverview>(`/me/revenue?range=${range}`),
      apiClient<RevenuePage>(`/me/revenue/history?page=1&pageSize=50`),
    ]);
    const bookings: PtRevenueBookingItemViewModel[] = (history.items || []).map((item) => ({ bookingId: item.appointment_id, bookingCode: `BK-${item.appointment_id.slice(0, 8).toUpperCase()}`, clientName: 'Hội viên', serviceName: 'Buổi huấn luyện', completedDate: new Date(item.date).toLocaleString('vi-VN'), grossAmountVnd: item.gross_vnd, platformFeeVnd: item.platform_fee_vnd, ptShareVnd: item.net_vnd, payoutStatus: item.settlement_status.toLowerCase().includes('paid') ? 'paid_out' : item.settlement_status.toLowerCase().includes('hold') ? 'on_hold' : item.paid_out_vnd > 0 ? 'approved' : 'pending' }));
    return { overview, bookings };
  },
};
