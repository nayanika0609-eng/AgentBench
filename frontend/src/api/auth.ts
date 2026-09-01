import { apiClient } from './client';
import type { User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export async function login({ email, password }: LoginPayload) {
  // Backend uses OAuth2PasswordRequestForm: x-www-form-urlencoded, "username" = email.
  const form = new URLSearchParams();
  form.set('username', email);
  form.set('password', password);

  const { data } = await apiClient.post<{ access_token: string; token_type: string }>(
    '/auth/login',
    form,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<User>('/auth/register', payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}
