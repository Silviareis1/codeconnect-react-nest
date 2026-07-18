export type AuthUser = {
  id: string;
  nome: string;
  email: string;
};

export type RegisterInput = {
  nome: string;
  email: string;
  senha: string;
};

export type LoginInput = {
  email: string;
  senha: string;
};

export type UserDataResponse = {
  message: string;
  data: AuthUser;
};

export type LoginResponse = {
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};

export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

export type AuthField = 'nome' | 'email' | 'senha';
export type AuthFieldErrors = Partial<Record<AuthField, string>>;
