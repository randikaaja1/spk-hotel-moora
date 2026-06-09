import { apiRequest } from "./apiClient";
import type { DashboardSummary } from "../types/dashboard";

// getDashboardSummary mengambil ringkasan utama dashboard admin.
export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/dashboard/summary");
}
