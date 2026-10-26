export type SettlementDisplayStatus = 'pending' | 'on_hold' | 'approved' | 'paid_out';

export function mapSettlementStatus(status: string): SettlementDisplayStatus {
  switch (status) {
    case 'paid': return 'paid_out';
    case 'approved': return 'approved';
    case 'on_hold': return 'on_hold';
    case 'pending_review': return 'pending';
    default: throw new Error('Trạng thái đối soát từ máy chủ chưa được hỗ trợ. Vui lòng tải lại hoặc liên hệ hỗ trợ.');
  }
}
