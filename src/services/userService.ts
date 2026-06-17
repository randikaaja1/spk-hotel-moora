import { apiRequest } from "./apiClient";
import type {
  ManagedUser,
  UpdateUserRolePayload,
  UpdateUserStatusPayload
} from "../types/user";

// getUsers mengambil seluruh pengguna untuk halaman admin.
export function getUsers(): Promise<ManagedUser[]> {
  return apiRequest<ManagedUser[]>("/users");
}

// updateUserRole mengubah role pengguna dari halaman admin.
export function updateUserRole(id: number, payload: UpdateUserRolePayload): Promise<ManagedUser> {
  return apiRequest<ManagedUser>(`/users/${id}/role`, {
    method: "PATCH",
    body: payload
  });
}

// updateUserStatus mengaktifkan atau menonaktifkan akun pengguna.
export function updateUserStatus(id: number, payload: UpdateUserStatusPayload): Promise<ManagedUser> {
  return apiRequest<ManagedUser>(`/users/${id}/status`, {
    method: "PATCH",
    body: payload
  });
}
