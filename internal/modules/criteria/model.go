package criteria

import "time"

const (
	AttributeBenefit = "benefit"
	AttributeCost    = "cost"
)

type Criterion struct {
	ID               int64
	Code             string
	Name             string
	Attribute        string
	Weight           float64
	NormalizedWeight float64
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type CriterionResponse struct {
	ID               int64     `json:"id"`
	Code             string    `json:"code"`
	Name             string    `json:"name"`
	Attribute        string    `json:"attribute"`
	Weight           float64   `json:"weight"`
	NormalizedWeight float64   `json:"normalized_weight"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type SaveCriterionRequest struct {
	Code      string  `json:"code" binding:"required"`
	Name      string  `json:"name" binding:"required"`
	Attribute string  `json:"attribute" binding:"required"`
	Weight    float64 `json:"weight" binding:"required"`
}

// ToResponse mengubah model kriteria menjadi bentuk response API.
func (c *Criterion) ToResponse() CriterionResponse {
	return CriterionResponse{
		ID:               c.ID,
		Code:             c.Code,
		Name:             c.Name,
		Attribute:        c.Attribute,
		Weight:           c.Weight,
		NormalizedWeight: c.NormalizedWeight,
		CreatedAt:        c.CreatedAt,
		UpdatedAt:        c.UpdatedAt,
	}
}

// ToResponses mengubah daftar kriteria menjadi daftar response API.
func ToResponses(items []Criterion) []CriterionResponse {
	responses := make([]CriterionResponse, 0, len(items))
	for i := range items {
		responses = append(responses, items[i].ToResponse())
	}

	return responses
}
