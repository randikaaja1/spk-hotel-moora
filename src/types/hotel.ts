export interface Hotel {
  id: number;
  name: string;
  price: number;
  rating_facility: number;
  accessibility: number;
  distance_km: number;
  location_score: number;
  view_score: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SaveHotelPayload {
  name: string;
  price: number;
  rating_facility: number;
  accessibility: number;
  distance_km: number;
  location_score: number;
  view_score: number;
  description: string;
}
