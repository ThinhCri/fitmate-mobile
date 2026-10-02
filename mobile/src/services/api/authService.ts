import { apiClient } from './client';
import {
  AdminMfaResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegistrationPendingResponse,
  ResetPasswordRequest,
  UserProfile,
  isAdminMfaResponse,
} from './types';

export class AdminMfaNotSupportedError extends Error {
  constructor(
    message = 'Tài khoản Quản trị viên (Admin) yêu cầu đăng nhập và xác thực 2 bước (MFA) trên Web Admin. Ứng dụng di động chỉ hỗ trợ đăng nhập Hội viên và Huấn luyện viên.'
  ) {
    super(message);
    this.name = 'AdminMfaNotSupportedError';
  }
}

export const authService = {
  /**
   * Register a new member or PT
   * Operation: register
   * Endpoint: POST /auth/register
   *
   * Constraints:
   * - Password must be 12-128 characters.
   * - PT registration NEVER sets verified certificate status.
   */
  async register(data: RegisterRequest): Promise<RegistrationPendingResponse> {
    if (!data.password || data.password.length < 12 || data.password.length > 128) {
      throw new Error('Mật khẩu phải có độ dài từ 12 đến 128 ký tự');
    }

    return apiClient<RegistrationPendingResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyEmail(email: string, code: string): Promise<void> {
    return apiClient<void>('/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async resendEmailVerification(email: string): Promise<void> {
    return apiClient<void>('/auth/email/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Login with email and password
   * Operation: login
   * Endpoint: POST /auth/login
   *
   * Disallows Admin MFA responses (HTTP 202) on mobile clients.
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const raw = await apiClient<AuthResponse | AdminMfaResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (isAdminMfaResponse(raw)) {
      throw new AdminMfaNotSupportedError();
    }

    if (!raw.access_token || !raw.refresh_token) {
      throw new Error('Dữ liệu xác thực không hợp lệ từ máy chủ');
    }

    return raw;
  },

  /**
   * Refresh session access token
   * Operation: refreshToken
   * Endpoint: POST /auth/refresh
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /**
   * Logout current session
   * Operation: logout
   * Endpoint: POST /auth/logout
   */
  async logout(tokenOverride?: string | null): Promise<void> {
    const headers: Record<string, string> = {};
    if (tokenOverride) {
      headers.Authorization = 'Bearer ' + tokenOverride;
    }
    return apiClient<void>('/auth/logout', {
      method: 'POST',
      headers,
    });
  },

  /**
   * Request password reset email
   * Operation: forgotPassword
   * Endpoint: POST /auth/password/forgot
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return apiClient<void>('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reset password with verification token
   * Operation: resetPassword
   * Endpoint: POST /auth/password/reset
   *
   * Constraints:
   * - New password must be 12-128 characters.
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    if (
      !data.new_password ||
      data.new_password.length < 12 ||
      data.new_password.length > 128
    ) {
      throw new Error('Mật khẩu mới phải có độ dài từ 12 đến 128 ký tự');
    }

    return apiClient<void>('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current authenticated user profile
   * Operation: getMe
   * Endpoint: GET /users/me
   */
  async getMe(): Promise<UserProfile> {
    return apiClient<UserProfile>('/users/me');
  },
};
