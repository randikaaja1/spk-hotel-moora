import { apiRequest } from "./apiClient";
import type {
  CalculateRecommendationPayload,
  CalculateRecommendationResponse,
  LatestRecommendationResponse
} from "../types/recommendation";

// calculateRecommendation menjalankan perhitungan MOORA dari backend.
export function calculateRecommendation(
  payload: CalculateRecommendationPayload = {}
): Promise<CalculateRecommendationResponse> {
  return apiRequest<CalculateRecommendationResponse>("/recommendations/calculate", {
    method: "POST",
    body: payload
  });
}

// getLatestRecommendation mengambil batch hasil rekomendasi terakhir.
export function getLatestRecommendation(): Promise<LatestRecommendationResponse> {
  return apiRequest<LatestRecommendationResponse>("/recommendations/latest");
}
