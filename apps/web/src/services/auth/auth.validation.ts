import { isPasswordValid } from '../../utils/passwordValidation';
import type {
  AuthFieldErrors,
  LoginInput,
  RegisterInput,
} from './auth.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateLogin(input: LoginInput): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (
    !EMAIL_PATTERN.test(input.email) ||
    input.email.length > EMAIL_MAX_LENGTH
  ) {
    errors.email = 'Informe um endereço de e-mail válido.';
  }

  if (!input.senha) {
    errors.senha = 'Informe sua senha.';
  }

  return errors;
}

export function validateRegister(input: RegisterInput): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const normalizedName = input.nome.trim();

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    errors.nome = 'Nome deve ter entre 2 e 100 caracteres.';
  }

  if (
    !EMAIL_PATTERN.test(input.email) ||
    input.email.length > EMAIL_MAX_LENGTH
  ) {
    errors.email = 'Informe um endereço de e-mail válido.';
  }

  if (!isPasswordValid(input.senha)) {
    errors.senha = 'A senha não atende aos requisitos.';
  }

  return errors;
}

export function mapApiMessagesToFields(messages: string[]): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  messages.forEach((message) => {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.startsWith('nome') && !errors.nome) {
      errors.nome = message;
    } else if (
      (normalizedMessage.startsWith('email') ||
        normalizedMessage.includes('usuário com este email')) &&
      !errors.email
    ) {
      errors.email = message;
    } else if (normalizedMessage.startsWith('senha') && !errors.senha) {
      errors.senha = message;
    }
  });

  return errors;
}
