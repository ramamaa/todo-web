export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser & {
    createdAt: string;
  };
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
