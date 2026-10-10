import { apiClient } from './client';

export interface SessionPackageStopWire {
  id: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Withdrawn';
  approval_source: 'None' | 'PtAccepted' | 'PtResponseTimedOut';
  requested_at_utc: string;
  pt_response_deadline_utc: string;
  refund_quote_vnd: number;
  finalized_at_utc: string | null;
}

export interface SessionPackageSessionWire {
  appointment_id: string;
  sequence: number;
  slot_start_utc: string;
  duration_minutes: number;
  status: string;
  paid_allocation_vnd: number;
}

export interface SessionPackageWire {
  id: string;
  member_id: string;
  pt_user_id: string;
  service_id: string;
  status: string;
  session_count: number;
  total_price_vnd: number;
  hold_expires_at_utc: string;
  initial_schedule_deadline_utc: string;
  make_up_deadline_utc: string;
  payment_id: string | null;
  payment_status: string | null;
  refunded_so_far_vnd: number;
  stop_request: SessionPackageStopWire | null;
  sessions: SessionPackageSessionWire[];
}

export interface SessionPackagePageWire {
  items: SessionPackageWire[];
  total: number;
  page: number;
  page_size: number;
}

export interface SessionPackageStopPreviewWire {
  package_id: string;
  calculated_at_utc: string;
  refund_quote_vnd: number;
  sessions: {
    appointment_id: string;
    sequence: number;
    slot_start_utc: string;
    status: string;
    paid_allocation_vnd: number;
    eligible_for_refund: boolean;
  }[];
}

export interface SessionPackageCheckoutWire {
  package_id: string;
  payment_id: string;
  amount_vnd: number;
  status: string;
  redirect_url: string | null;
}

const path = (id: string) => `/me/session-packages/${encodeURIComponent(id)}`;

export const sessionPackageService = {
  createHold(body: { pt_user_id: string; service_id: string;
    delivery_mode: 'in_person' | 'online'; slot_starts_utc: string[] },
    idempotencyKey: string): Promise<SessionPackageWire> {
    return apiClient<SessionPackageWire>('/me/session-packages/holds', {
      method: 'POST', headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(body),
    });
  },
  createPayment(id: string, acknowledgeShortNotice: boolean,
    idempotencyKey: string): Promise<SessionPackageCheckoutWire> {
    return apiClient<SessionPackageCheckoutWire>(`${path(id)}/payment-requests`, {
      method: 'POST', headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ acknowledge_short_notice: acknowledgeShortNotice }),
    });
  },
  listMine(page = 1): Promise<SessionPackagePageWire> {
    return apiClient<SessionPackagePageWire>(`/me/session-packages?page=${page}&pageSize=25`);
  },
  listAssigned(page = 1): Promise<SessionPackagePageWire> {
    return apiClient<SessionPackagePageWire>(`/me/session-packages/assigned?page=${page}&pageSize=25`);
  },
  get(id: string): Promise<SessionPackageWire> {
    return apiClient<SessionPackageWire>(path(id));
  },
  previewStop(id: string): Promise<SessionPackageStopPreviewWire> {
    return apiClient<SessionPackageStopPreviewWire>(`${path(id)}/stop-preview`);
  },
  requestStop(id: string, reason: string, expectedRefundQuoteVnd: number,
    idempotencyKey: string): Promise<SessionPackageStopWire> {
    return apiClient<SessionPackageStopWire>(`${path(id)}/stop-requests`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ reason, expected_refund_quote_vnd: expectedRefundQuoteVnd }),
    });
  },
  acceptStop(id: string, idempotencyKey: string): Promise<SessionPackageStopWire> {
    return apiClient<SessionPackageStopWire>(`${path(id)}/stop-requests/accept`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
  withdrawStop(id: string, requestId: string, idempotencyKey: string): Promise<SessionPackageStopWire> {
    return apiClient<SessionPackageStopWire>(`${path(id)}/stop-requests/${encodeURIComponent(requestId)}/withdraw`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
};
