package dashboard

import (
	"context"
	"errors"

	"spk-hotel-moora-service-go/internal/modules/criteria"
	"spk-hotel-moora-service-go/internal/modules/hotels"
	"spk-hotel-moora-service-go/internal/modules/recommendations"
)

type Service struct {
	repository               *Repository
	hotelRepository          *hotels.Repository
	criterionRepository      *criteria.Repository
	recommendationRepository *recommendations.Repository
}

// NewService membuat service dashboard untuk menyusun ringkasan admin.
func NewService(
	repository *Repository,
	hotelRepository *hotels.Repository,
	criterionRepository *criteria.Repository,
	recommendationRepository *recommendations.Repository,
) *Service {
	return &Service{
		repository:               repository,
		hotelRepository:          hotelRepository,
		criterionRepository:      criterionRepository,
		recommendationRepository: recommendationRepository,
	}
}

// GetSummary mengambil ringkasan data utama untuk dashboard admin.
func (s *Service) GetSummary(ctx context.Context) (*SummaryResponse, error) {
	totalHotels, err := s.hotelRepository.Count(ctx)
	if err != nil {
		return nil, err
	}

	totalCriteria, err := s.criterionRepository.Count(ctx)
	if err != nil {
		return nil, err
	}

	totalUsers, err := s.repository.CountUsers(ctx)
	if err != nil {
		return nil, err
	}

	response := &SummaryResponse{
		TotalHotels:   totalHotels,
		TotalCriteria: totalCriteria,
		TotalUsers:    totalUsers,
	}

	topResult, err := s.recommendationRepository.FindTopResult(ctx)
	if errors.Is(err, recommendations.ErrRecommendationNotFound) {
		return response, nil
	}

	if err != nil {
		return nil, err
	}

	response.TopRecommendation = &TopRecommendationResponse{
		HotelID:         topResult.Hotel.ID,
		HotelName:       topResult.Hotel.Name,
		PreferenceValue: topResult.PreferenceValue,
		Rank:            topResult.Rank,
		CalculationType: topResult.CalculationType,
		CreatedAt:       topResult.CreatedAt,
	}

	return response, nil
}
