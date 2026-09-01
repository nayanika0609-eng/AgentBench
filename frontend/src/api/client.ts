import axios, { AxiosError } from 'axios';
import type { ApiErrorShape } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';
const TOKEN_KEY = 'agentbench_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fired whenever a 401 slips through so the AuthContext can force a logout.
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

/** Extract a human-readable message from a FastAPI error response. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Cannot reach the AgentBench API. Check that the backend is running.';
    }
    const data = error.response.data as ApiErrorShape | undefined;
    const detail = data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => d.msg).join(', ');
    }
    if (error.response.status === 404) return 'Resource not found.';
    if (error.response.status === 403) return 'You do not have access to this resource.';
    if (error.response.status >= 500) return 'The server ran into a problem. Please try again shortly.';
  }
  return fallback;
}
