package hotels

import "time"

type Hotel struct {
	ID              int64
	Name            string
	Price           float64
	RatingFacility  float64
	Accessibility   float64
	DistanceKM      float64
	GoogleMapsURL   string
	LocationScore   float64
	ViewScore       float64
	Description     string
	CriterionValues []HotelCriterionValue
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type HotelCriterionValue struct {
	CriterionID int64
	Code        string
	Name        string
	Attribute   string
	Value       float64
}

type HotelResponse struct {
	ID              int64                         `json:"id"`
	Name            string                        `json:"name"`
	Price           float64                       `json:"price"`
	RatingFacility  float64                       `json:"rating_facility"`
	Accessibility   float64                       `json:"accessibility"`
	DistanceKM      float64                       `json:"distance_km"`
	GoogleMapsURL   string                        `json:"google_maps_url"`
	LocationScore   float64                       `json:"location_score"`
	ViewScore       float64                       `json:"view_score"`
	Description     string                        `json:"description"`
	CriterionValues []HotelCriterionValueResponse `json:"criterion_values"`
	CreatedAt       time.Time                     `json:"created_at"`
	UpdatedAt       time.Time                     `json:"updated_at"`
}

type HotelCriterionValueResponse struct {
	CriterionID int64   `json:"criterion_id"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Attribute   string  `json:"attribute"`
	Value       float64 `json:"value"`
}

type SaveHotelRequest struct {
	Name            string                           `json:"name" binding:"required"`
	Price           float64                          `json:"price"`
	RatingFacility  float64                          `json:"rating_facility"`
	Accessibility   float64                          `json:"accessibility"`
	DistanceKM      float64                          `json:"distance_km"`
	GoogleMapsURL   string                           `json:"google_maps_url"`
	LocationScore   float64                          `json:"location_score"`
	ViewScore       float64                          `json:"view_score"`
	Description     string                           `json:"description"`
	CriterionValues []SaveHotelCriterionValueRequest `json:"criterion_values"`
}

type SaveHotelCriterionValueRequest struct {
	CriterionID int64   `json:"criterion_id"`
	Value       float64 `json:"value"`
}

// ToResponse mengubah model hotel menjadi bentuk response API.
func (h *Hotel) ToResponse() HotelResponse {
	return HotelResponse{
		ID:              h.ID,
		Name:            h.Name,
		Price:           h.Price,
		RatingFacility:  h.RatingFacility,
		Accessibility:   h.Accessibility,
		DistanceKM:      h.DistanceKM,
		GoogleMapsURL:   h.GoogleMapsURL,
		LocationScore:   h.LocationScore,
		ViewScore:       h.ViewScore,
		Description:     h.Description,
		CriterionValues: ToCriterionValueResponses(h.CriterionValues),
		CreatedAt:       h.CreatedAt,
		UpdatedAt:       h.UpdatedAt,
	}
}

// ToCriterionValueResponses mengubah nilai kriteria hotel menjadi response API.
func ToCriterionValueResponses(items []HotelCriterionValue) []HotelCriterionValueResponse {
	responses := make([]HotelCriterionValueResponse, 0, len(items))
	for _, item := range items {
		responses = append(responses, HotelCriterionValueResponse{
			CriterionID: item.CriterionID,
			Code:        item.Code,
			Name:        item.Name,
			Attribute:   item.Attribute,
			Value:       item.Value,
		})
	}

	return responses
}

// ToResponses mengubah daftar hotel menjadi daftar response API.
func ToResponses(items []Hotel) []HotelResponse {
	responses := make([]HotelResponse, 0, len(items))
	for i := range items {
		responses = append(responses, items[i].ToResponse())
	}

	return responses
}
