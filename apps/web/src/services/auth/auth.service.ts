import { apiClient } from '../../http/apiClient';
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  UserDataResponse,
} from './auth.types';

export async function register(input: RegisterInput) {
  const response = await apiClient.post<UserDataResponse>(
    '/auth/register',
    input,
  );
  return response.data;
}

export async function login(input: LoginInput) {
  const response = await apiClient.post<LoginResponse>('/auth/login', input);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get<UserDataResponse>('/auth/me', {
    requiresAuth: true,
  });
  return response.data;
}
