package recommendations

import (
	"time"

	"spk-hotel-moora-service-go/internal/modules/hotels"
	"spk-hotel-moora-service-go/internal/modules/preferences"
)

const (
	CalculationTypeAdmin = "admin"
	CalculationTypeUser  = "user"
)

type CalculateRequest struct {
	Preference *preferences.SavePreferenceRequest `json:"preference"`
	SaveResult *bool                              `json:"save_result"`
}

type CriterionScoreResponse struct {
	CriterionID      int64   `json:"criterion_id"`
	Code             string  `json:"code"`
	Name             string  `json:"name"`
	Attribute        string  `json:"attribute"`
	Weight           float64 `json:"weight"`
	NormalizedWeight float64 `json:"normalized_weight"`
	RawValue         float64 `json:"raw_value"`
	NormalizedValue  float64 `json:"normalized_value"`
	WeightedValue    float64 `json:"weighted_value"`
}

type RecommendationItemResponse struct {
	Rank            int                      `json:"rank"`
	Hotel           hotels.HotelResponse     `json:"hotel"`
	PreferenceValue float64                  `json:"preference_value"`
	Scores          []CriterionScoreResponse `json:"scores,omitempty"`
}

type CalculateResponse struct {
	CalculationType string                        `json:"calculation_type"`
	UsedPreference  *preferences.PreferenceFilter `json:"used_preference,omitempty"`
	TotalHotels     int                           `json:"total_hotels"`
	FilteredHotels  int                           `json:"filtered_hotels"`
	Results         []RecommendationItemResponse  `json:"results"`
}

type LatestResponse struct {
	CalculationType string                       `json:"calculation_type"`
	CreatedAt       time.Time                    `json:"created_at"`
	Results         []RecommendationItemResponse `json:"results"`
}

type StoredResult struct {
	CalculationType string
	CreatedAt       time.Time
	Rank            int
	PreferenceValue float64
	Hotel           hotels.Hotel
}

type calculationCriterion struct {
	ID               int64
	Code             string
	Name             string
	Attribute        string
	Weight           float64
	NormalizedWeight float64
}
