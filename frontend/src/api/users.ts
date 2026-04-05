import api from './axios';
import type { ApiSuccess, Role, Status, User } from '../types';

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export async function getUsers(params: { page?: number; limit?: number; search?: string }) {
  const response = await api.get<ApiSuccess<User[]>>('/users', { params });
  return response.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post<ApiSuccess<User>>('/users', payload);
  return response.data.data;
}

export async function updateUser(id: string, payload: { role?: Role; status?: Status }): Promise<User> {
  const response = await api.patch<ApiSuccess<User>>(`/users/${id}`, payload);
  return response.data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
