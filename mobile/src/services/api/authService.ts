import { apiClient } from './client';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserProfile,
} from './types';

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
  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (!data.password || data.password.length < 12 || data.password.length > 128) {
      throw new Error('Mật khẩu phải có độ dài từ 12 đến 128 ký tự');
    }

    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login with email and password
   * Operation: login
   * Endpoint: POST /auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
  async logout(): Promise<void> {
    return apiClient<void>('/auth/logout', {
      method: 'POST',
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
