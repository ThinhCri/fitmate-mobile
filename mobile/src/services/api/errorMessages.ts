import { isProblemDetails } from './types';

const CODE_MESSAGES: Record<string, string> = {
  'FITMATE.AUTH.EMAIL_NOT_VERIFIED':
    'Email của bạn chưa được xác minh. Vui lòng nhập mã đã được gửi đến email.',
  'FITMATE.AUTH.INVALID_CREDENTIALS': 'Email hoặc mật khẩu không chính xác.',
  'FITMATE.AUTH.FORBIDDEN': 'Bạn không có quyền thực hiện thao tác này.',
  'FITMATE.VALIDATION.FAILED': 'Thông tin đã nhập chưa hợp lệ. Vui lòng kiểm tra lại.',
  'FITMATE.AI.UNAVAILABLE': 'Tính năng nhận diện món ăn đang tạm thời chưa sẵn sàng.',
  'FITMATE.AI.INVALID_OUTPUT': 'AI chưa thể nhận diện ảnh này. Vui lòng thử ảnh khác hoặc nhập thủ công.',
  'FITMATE.AI.RATE_LIMITED': 'AI đang xử lý quá nhiều yêu cầu. Vui lòng chờ một lát rồi thử lại.',
};

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Thông tin gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.',
  401: 'Thông tin đăng nhập không chính xác hoặc phiên đăng nhập đã hết hạn.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy thông tin bạn yêu cầu.',
  409: 'Dữ liệu đã thay đổi hoặc bị trùng. Vui lòng tải lại và thử lại.',
  413: 'Tệp đã chọn quá lớn. Vui lòng chọn tệp có dung lượng nhỏ hơn.',
  422: 'Thông tin đã nhập chưa hợp lệ. Vui lòng kiểm tra lại.',
  429: 'Bạn thao tác quá nhanh. Vui lòng chờ một lát rồi thử lại.',
  500: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  502: 'Máy chủ đang tạm thời gián đoạn. Vui lòng thử lại sau.',
  503: 'Dịch vụ đang tạm thời không khả dụng. Vui lòng thử lại sau.',
  504: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại sau.',
};

const ENGLISH_DETAIL_MESSAGES: Array<[RegExp, string]> = [
  [/rate limit|too many requests/i, STATUS_MESSAGES[429]],
  [/invalid (email|username).*password|invalid credentials/i, 'Email hoặc mật khẩu không chính xác.'],
  [/email.*(already exists|already registered)|email already exists/i, 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.'],
  [/account.*(locked|disabled|suspended)/i, 'Tài khoản đang bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.'],
  [/(verification|otp).*(invalid|expired)|invalid.*(verification|otp)/i, 'Mã xác minh không đúng hoặc đã hết hạn. Vui lòng yêu cầu mã mới.'],
];

function isVietnamese(message: string): boolean {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    message
  );
}

function readServerDetail(data: unknown): string | undefined {
  if (isProblemDetails(data)) {
    return data.detail || data.title;
  }

  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as Record<string, unknown>).message;
    return typeof message === 'string' ? message : undefined;
  }

  return typeof data === 'string' ? data : undefined;
}

/**
 * Converts backend/HTTP errors into safe, understandable Vietnamese copy.
 * Raw English details remain in ApiError.data for diagnostics but are never
 * presented directly to end users.
 */
export function getUserFacingApiErrorMessage(status: number, data: unknown): string {
  if (isProblemDetails(data) && data.code && CODE_MESSAGES[data.code]) {
    return CODE_MESSAGES[data.code];
  }

  const serverDetail = readServerDetail(data)?.trim();
  if (serverDetail) {
    if (isVietnamese(serverDetail)) {
      return serverDetail;
    }

    const translated = ENGLISH_DETAIL_MESSAGES.find(([pattern]) => pattern.test(serverDetail));
    if (translated) {
      return translated[1];
    }
  }

  return STATUS_MESSAGES[status] || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
}
