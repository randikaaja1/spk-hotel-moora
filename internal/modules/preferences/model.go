package preferences

import "time"

type Preference struct {
	ID               int64
	UserID           int64
	MaxBudget        *float64
	MinRating        *float64
	MinAccessibility *float64
	MaxDistance      *float64
	MinView          *float64
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type PreferenceFilter struct {
	MaxBudget        *float64 `json:"max_budget,omitempty"`
	MinRating        *float64 `json:"min_rating,omitempty"`
	MinAccessibility *float64 `json:"min_accessibility,omitempty"`
	MaxDistance      *float64 `json:"max_distance,omitempty"`
	MinView          *float64 `json:"min_view,omitempty"`
}

type PreferenceResponse struct {
	ID               int64     `json:"id"`
	UserID           int64     `json:"user_id"`
	MaxBudget        *float64  `json:"max_budget,omitempty"`
	MinRating        *float64  `json:"min_rating,omitempty"`
	MinAccessibility *float64  `json:"min_accessibility,omitempty"`
	MaxDistance      *float64  `json:"max_distance,omitempty"`
	MinView          *float64  `json:"min_view,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type SavePreferenceRequest struct {
	MaxBudget        *float64 `json:"max_budget"`
	MinRating        *float64 `json:"min_rating"`
	MinAccessibility *float64 `json:"min_accessibility"`
	MaxDistance      *float64 `json:"max_distance"`
	MinView          *float64 `json:"min_view"`
}

// ToResponse mengubah model preferensi menjadi bentuk response API.
func (p *Preference) ToResponse() PreferenceResponse {
	return PreferenceResponse{
		ID:               p.ID,
		UserID:           p.UserID,
		MaxBudget:        p.MaxBudget,
		MinRating:        p.MinRating,
		MinAccessibility: p.MinAccessibility,
		MaxDistance:      p.MaxDistance,
		MinView:          p.MinView,
		CreatedAt:        p.CreatedAt,
		UpdatedAt:        p.UpdatedAt,
	}
}

// ToFilter mengubah preferensi tersimpan menjadi filter rekomendasi.
func (p *Preference) ToFilter() PreferenceFilter {
	return PreferenceFilter{
		MaxBudget:        p.MaxBudget,
		MinRating:        p.MinRating,
		MinAccessibility: p.MinAccessibility,
		MaxDistance:      p.MaxDistance,
		MinView:          p.MinView,
	}
}
