export interface StoredUser {
  id: string;
  nome: string;
  email: string;
  passwordHash: string;
}

export interface PublicUser {
  id: string;
  nome: string;
  email: string;
}

export interface AuthenticatedRequest {
  user: PublicUser;
}
