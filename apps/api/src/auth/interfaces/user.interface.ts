export interface PublicUser {
  id: string;
  nome: string;
  email: string;
}

export interface AuthenticatedRequest {
  user: PublicUser;
}
