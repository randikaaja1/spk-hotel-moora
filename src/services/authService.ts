import { apiRequest } from "./apiClient";
import type { LoginPayload, LoginResponse, RegisterPayload, User } from "../types/auth";

// login mengirim kredensial dan menerima token JWT beserta profil user.
export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload
  });
}

// register membuat akun user baru melalui endpoint public backend.
export function register(payload: RegisterPayload): Promise<User> {
  return apiRequest<User>("/auth/register", {
    method: "POST",
    body: payload
  });
}

// getMe mengambil profil user berdasarkan token aktif.
export function getMe(): Promise<User> {
  return apiRequest<User>("/auth/me");
}
