package dashboard

import "time"

type SummaryResponse struct {
	TotalHotels       int64                      `json:"total_hotels"`
	TotalCriteria     int64                      `json:"total_criteria"`
	TotalUsers        int64                      `json:"total_users"`
	TopRecommendation *TopRecommendationResponse `json:"top_recommendation,omitempty"`
}

type TopRecommendationResponse struct {
	HotelID         int64     `json:"hotel_id"`
	HotelName       string    `json:"hotel_name"`
	PreferenceValue float64   `json:"preference_value"`
	Rank            int       `json:"rank"`
	CalculationType string    `json:"calculation_type"`
	CreatedAt       time.Time `json:"created_at"`
}
