package hotels

import "time"

type Hotel struct {
	ID             int64
	Name           string
	Price          float64
	RatingFacility float64
	Accessibility  float64
	DistanceKM     float64
	LocationScore  float64
	ViewScore      float64
	Description    string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type HotelResponse struct {
	ID             int64     `json:"id"`
	Name           string    `json:"name"`
	Price          float64   `json:"price"`
	RatingFacility float64   `json:"rating_facility"`
	Accessibility  float64   `json:"accessibility"`
	DistanceKM     float64   `json:"distance_km"`
	LocationScore  float64   `json:"location_score"`
	ViewScore      float64   `json:"view_score"`
	Description    string    `json:"description"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type SaveHotelRequest struct {
	Name           string  `json:"name" binding:"required"`
	Price          float64 `json:"price" binding:"required"`
	RatingFacility float64 `json:"rating_facility" binding:"required"`
	Accessibility  float64 `json:"accessibility" binding:"required"`
	DistanceKM     float64 `json:"distance_km" binding:"required"`
	LocationScore  float64 `json:"location_score" binding:"required"`
	ViewScore      float64 `json:"view_score" binding:"required"`
	Description    string  `json:"description"`
}

// ToResponse mengubah model hotel menjadi bentuk response API.
func (h *Hotel) ToResponse() HotelResponse {
	return HotelResponse{
		ID:             h.ID,
		Name:           h.Name,
		Price:          h.Price,
		RatingFacility: h.RatingFacility,
		Accessibility:  h.Accessibility,
		DistanceKM:     h.DistanceKM,
		LocationScore:  h.LocationScore,
		ViewScore:      h.ViewScore,
		Description:    h.Description,
		CreatedAt:      h.CreatedAt,
		UpdatedAt:      h.UpdatedAt,
	}
}

// ToResponses mengubah daftar hotel menjadi daftar response API.
func ToResponses(items []Hotel) []HotelResponse {
	responses := make([]HotelResponse, 0, len(items))
	for i := range items {
		responses = append(responses, items[i].ToResponse())
	}

	return responses
}
