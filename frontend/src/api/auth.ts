import api from './axios';
import type { ApiSuccess, User } from '../types';

type LoginPayload = { email: string; password: string };

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<ApiSuccess<LoginResponse>>('/auth/login', payload);
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {});
}

export async function forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
  const response = await api.post<ApiSuccess<{ message: string; resetToken?: string }>>(
    '/auth/forgot-password',
    { email },
  );
  return response.data.data;
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const response = await api.post<ApiSuccess<{ message: string }>>('/auth/reset-password', payload);
  return response.data.data;
}
