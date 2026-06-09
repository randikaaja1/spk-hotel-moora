export interface PreferenceFilter {
  max_budget?: number;
  min_rating?: number;
  min_accessibility?: number;
  max_distance?: number;
  min_view?: number;
}

export interface Preference {
  id: number;
  user_id: number;
  max_budget?: number;
  min_rating?: number;
  min_accessibility?: number;
  max_distance?: number;
  min_view?: number;
  created_at: string;
  updated_at: string;
}
