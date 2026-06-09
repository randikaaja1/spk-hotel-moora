import type { Hotel } from "./hotel";
import type { PreferenceFilter } from "./preference";

export interface CriterionScore {
  criterion_id: number;
  code: string;
  name: string;
  attribute: "benefit" | "cost";
  weight: number;
  normalized_weight: number;
  raw_value: number;
  normalized_value: number;
  weighted_value: number;
}

export interface RecommendationItem {
  rank: number;
  hotel: Hotel;
  preference_value: number;
  scores?: CriterionScore[];
}

export interface CalculateRecommendationPayload {
  preference?: PreferenceFilter;
  save_result?: boolean;
}

export interface CalculateRecommendationResponse {
  calculation_type: "admin" | "user";
  used_preference?: PreferenceFilter;
  total_hotels: number;
  filtered_hotels: number;
  results: RecommendationItem[];
}

export interface LatestRecommendationResponse {
  calculation_type: "admin" | "user";
  created_at: string;
  results: RecommendationItem[];
}
