export interface Hotel {
  id: number;
  name: string;
  price: number;
  rating_facility: number;
  accessibility: number;
  distance_km: number;
  google_maps_url: string;
  location_score: number;
  view_score: number;
  description: string;
  criterion_values: HotelCriterionValue[];
  created_at: string;
  updated_at: string;
}

export interface HotelCriterionValue {
  criterion_id: number;
  code: string;
  name: string;
  attribute: "benefit" | "cost";
  value: number;
}

export interface SaveHotelPayload {
  name: string;
  price: number;
  rating_facility: number;
  accessibility: number;
  distance_km: number;
  google_maps_url: string;
  location_score: number;
  view_score: number;
  description: string;
  criterion_values: SaveHotelCriterionValuePayload[];
}

export interface SaveHotelCriterionValuePayload {
  criterion_id: number;
  value: number;
}
