import axios from 'axios';
import { env } from '../config/env';
import {
  clearAccessToken,
  getAccessToken,
  hasAccessToken,
} from '../services/auth/tokenStorage';
import { emitUnauthorized } from '../services/auth/authEvents';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  if (!config.requiresAuth) return config;

  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.requiresAuth &&
      hasAccessToken()
    ) {
      clearAccessToken();
      emitUnauthorized();
    }

    return Promise.reject(error);
  },
);
