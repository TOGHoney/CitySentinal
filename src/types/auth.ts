export type UserRole = "authority";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  department: string;
  contact: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ForgotPasswordPayload {
  username: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetSent: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}