import axios from 'axios';
import type { ApiErrorResponse } from '../services/auth/auth.types';

export type NormalizedApiError = {
  kind:
    | 'validation'
    | 'unauthorized'
    | 'conflict'
    | 'network'
    | 'server'
    | 'unknown';
  status?: number;
  messages: string[];
};

function normalizeMessages(message: unknown): string[] {
  if (typeof message === 'string' && message.trim()) {
    return [message];
  }

  if (Array.isArray(message)) {
    return message.filter(
      (item): item is string => typeof item === 'string' && Boolean(item.trim()),
    );
  }

  return [];
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      kind: 'unknown',
      messages: ['Não foi possível concluir a operação. Tente novamente.'],
    };
  }

  if (!error.response) {
    return {
      kind: 'network',
      messages: ['Não foi possível conectar à API. Tente novamente.'],
    };
  }

  const status = error.response.status;
  const responseMessages = normalizeMessages(error.response.data?.message);
  const fallbackMessage =
    status >= 500
      ? 'A API está indisponível no momento. Tente novamente mais tarde.'
      : 'Não foi possível concluir a operação. Tente novamente.';
  const messages = responseMessages.length
    ? responseMessages
    : [fallbackMessage];

  if (status === 400) return { kind: 'validation', status, messages };
  if (status === 401) return { kind: 'unauthorized', status, messages };
  if (status === 409) return { kind: 'conflict', status, messages };
  if (status >= 500) return { kind: 'server', status, messages: [fallbackMessage] };

  return { kind: 'unknown', status, messages: [fallbackMessage] };
}
