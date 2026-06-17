import type { Role } from "./api";

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRolePayload {
  role: Role;
}

export interface UpdateUserStatusPayload {
  is_active: boolean;
}
