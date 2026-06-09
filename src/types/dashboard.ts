export interface TopRecommendation {
  hotel_id: number;
  hotel_name: string;
  preference_value: number;
  rank: number;
  calculation_type: "admin" | "user";
  created_at: string;
}

export interface DashboardSummary {
  total_hotels: number;
  total_criteria: number;
  total_users: number;
  top_recommendation?: TopRecommendation;
}
