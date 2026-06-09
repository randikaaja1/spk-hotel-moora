import { apiRequest } from "./apiClient";
import type { Criterion, SaveCriterionPayload } from "../types/criterion";

// getCriteria mengambil daftar kriteria MOORA.
export function getCriteria(): Promise<Criterion[]> {
  return apiRequest<Criterion[]>("/criteria");
}

// createCriterion menyimpan kriteria baru dari halaman admin.
export function createCriterion(payload: SaveCriterionPayload): Promise<Criterion> {
  return apiRequest<Criterion>("/criteria", {
    method: "POST",
    body: payload
  });
}

// updateCriterion memperbarui kriteria berdasarkan id.
export function updateCriterion(
  id: number,
  payload: SaveCriterionPayload
): Promise<Criterion> {
  return apiRequest<Criterion>(`/criteria/${id}`, {
    method: "PUT",
    body: payload
  });
}

// deleteCriterion menghapus kriteria berdasarkan id.
export function deleteCriterion(id: number): Promise<{ id: number }> {
  return apiRequest<{ id: number }>(`/criteria/${id}`, {
    method: "DELETE"
  });
}
