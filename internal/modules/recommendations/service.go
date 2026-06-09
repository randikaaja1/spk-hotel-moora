package recommendations

import (
	"context"
	"errors"
	"math"
	"sort"
	"strings"

	"spk-hotel-moora-service-go/internal/modules/auth"
	"spk-hotel-moora-service-go/internal/modules/criteria"
	"spk-hotel-moora-service-go/internal/modules/hotels"
	"spk-hotel-moora-service-go/internal/modules/preferences"
)

type Service struct {
	repository           *Repository
	hotelRepository      *hotels.Repository
	criterionRepository  *criteria.Repository
	preferenceRepository *preferences.Repository
}

// NewService membuat service rekomendasi untuk menjalankan perhitungan MOORA.
func NewService(
	repository *Repository,
	hotelRepository *hotels.Repository,
	criterionRepository *criteria.Repository,
	preferenceRepository *preferences.Repository,
) *Service {
	return &Service{
		repository:           repository,
		hotelRepository:      hotelRepository,
		criterionRepository:  criterionRepository,
		preferenceRepository: preferenceRepository,
	}
}

// Calculate menghitung ranking hotel menggunakan metode MOORA.
func (s *Service) Calculate(ctx context.Context, userID int64, role string, request CalculateRequest) (*CalculateResponse, error) {
	if userID <= 0 {
		return nil, ErrRecommendationUserMissing
	}

	calculationType := resolveCalculationType(role)
	if calculationType == "" {
		return nil, ErrRecommendationUserMissing
	}

	hotelItems, err := s.hotelRepository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	if len(hotelItems) == 0 {
		return nil, ErrNoHotelsAvailable
	}

	criterionItems, err := s.criterionRepository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	if len(criterionItems) == 0 {
		return nil, ErrNoCriteriaAvailable
	}

	preparedCriteria, err := prepareCriteria(criterionItems)
	if err != nil {
		return nil, err
	}

	usedPreference, err := s.resolvePreference(ctx, role, userID, request)
	if err != nil {
		return nil, err
	}

	filteredHotels := filterHotelsByPreference(hotelItems, usedPreference)
	if len(filteredHotels) == 0 {
		return nil, ErrNoEligibleHotels
	}

	results, err := calculateMOORA(filteredHotels, preparedCriteria)
	if err != nil {
		return nil, err
	}

	if shouldSaveResult(request.SaveResult) {
		if err := s.repository.SaveResults(ctx, userID, calculationType, results); err != nil {
			return nil, err
		}
	}

	return &CalculateResponse{
		CalculationType: calculationType,
		UsedPreference:  usedPreference,
		TotalHotels:     len(hotelItems),
		FilteredHotels:  len(filteredHotels),
		Results:         results,
	}, nil
}

// GetLatest mengambil hasil rekomendasi terakhir untuk user yang sedang login.
func (s *Service) GetLatest(ctx context.Context, userID int64, role string) (*LatestResponse, error) {
	if userID <= 0 {
		return nil, ErrRecommendationUserMissing
	}

	calculationType := resolveCalculationType(role)
	if calculationType == "" {
		return nil, ErrRecommendationUserMissing
	}

	storedResults, err := s.repository.FindLatest(ctx, userID, calculationType)
	if err != nil {
		return nil, err
	}

	results := make([]RecommendationItemResponse, 0, len(storedResults))
	for _, storedResult := range storedResults {
		hotelResponse := storedResult.Hotel.ToResponse()
		results = append(results, RecommendationItemResponse{
			Rank:            storedResult.Rank,
			Hotel:           hotelResponse,
			PreferenceValue: storedResult.PreferenceValue,
		})
	}

	return &LatestResponse{
		CalculationType: storedResults[0].CalculationType,
		CreatedAt:       storedResults[0].CreatedAt,
		Results:         results,
	}, nil
}

// resolvePreference menentukan filter yang dipakai user sebelum MOORA dijalankan.
func (s *Service) resolvePreference(ctx context.Context, role string, userID int64, request CalculateRequest) (*preferences.PreferenceFilter, error) {
	if role != auth.RoleUser {
		return nil, nil
	}

	if request.Preference != nil {
		return preferences.BuildFilterFromRequest(*request.Preference, false)
	}

	preference, err := s.preferenceRepository.FindByUserID(ctx, userID)
	if errors.Is(err, preferences.ErrPreferenceNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	filter := preference.ToFilter()

	return &filter, nil
}

// resolveCalculationType menentukan tipe perhitungan dari role yang tersimpan di JWT.
func resolveCalculationType(role string) string {
	switch role {
	case auth.RoleAdmin:
		return CalculationTypeAdmin
	case auth.RoleUser:
		return CalculationTypeUser
	default:
		return ""
	}
}

// shouldSaveResult menentukan apakah batch hasil perhitungan perlu disimpan.
func shouldSaveResult(saveResult *bool) bool {
	return saveResult == nil || *saveResult
}

// prepareCriteria menghitung bobot ternormalisasi runtime agar tidak bergantung pada nilai tersimpan.
func prepareCriteria(items []criteria.Criterion) ([]calculationCriterion, error) {
	totalWeight := 0.0
	for _, item := range items {
		if item.Weight > 0 {
			totalWeight += item.Weight
		}
	}

	if totalWeight <= 0 {
		return nil, ErrInvalidCriteriaWeight
	}

	prepared := make([]calculationCriterion, 0, len(items))
	for _, item := range items {
		if _, err := resolveHotelValue(hotels.Hotel{}, item.Code, item.Name); err != nil {
			return nil, err
		}

		prepared = append(prepared, calculationCriterion{
			ID:               item.ID,
			Code:             item.Code,
			Name:             item.Name,
			Attribute:        item.Attribute,
			Weight:           item.Weight,
			NormalizedWeight: item.Weight / totalWeight,
		})
	}

	return prepared, nil
}

// filterHotelsByPreference menyaring hotel berdasarkan preferensi user sebelum MOORA.
func filterHotelsByPreference(items []hotels.Hotel, filter *preferences.PreferenceFilter) []hotels.Hotel {
	if filter == nil {
		return items
	}

	filtered := make([]hotels.Hotel, 0, len(items))
	for _, item := range items {
		if filter.MaxBudget != nil && item.Price > *filter.MaxBudget {
			continue
		}

		if filter.MinRating != nil && item.RatingFacility < *filter.MinRating {
			continue
		}

		if filter.MinAccessibility != nil && item.Accessibility < *filter.MinAccessibility {
			continue
		}

		if filter.MaxDistance != nil && item.DistanceKM > *filter.MaxDistance {
			continue
		}

		if filter.MinView != nil && item.ViewScore < *filter.MinView {
			continue
		}

		filtered = append(filtered, item)
	}

	return filtered
}

// calculateMOORA menjalankan normalisasi, pembobotan, dan ranking nilai Yi.
func calculateMOORA(hotelItems []hotels.Hotel, criterionItems []calculationCriterion) ([]RecommendationItemResponse, error) {
	denominators := make(map[int64]float64, len(criterionItems))

	for _, criterion := range criterionItems {
		sumSquares := 0.0
		for _, hotel := range hotelItems {
			value, err := resolveHotelValue(hotel, criterion.Code, criterion.Name)
			if err != nil {
				return nil, err
			}

			sumSquares += math.Pow(value, 2)
		}

		denominators[criterion.ID] = math.Sqrt(sumSquares)
	}

	results := make([]RecommendationItemResponse, 0, len(hotelItems))
	for _, hotel := range hotelItems {
		hotelResponse := hotel.ToResponse()
		result := RecommendationItemResponse{
			Hotel:  hotelResponse,
			Scores: make([]CriterionScoreResponse, 0, len(criterionItems)),
		}

		totalBenefit := 0.0
		totalCost := 0.0
		for _, criterion := range criterionItems {
			rawValue, err := resolveHotelValue(hotel, criterion.Code, criterion.Name)
			if err != nil {
				return nil, err
			}

			normalizedValue := 0.0
			if denominators[criterion.ID] > 0 {
				normalizedValue = rawValue / denominators[criterion.ID]
			}

			weightedValue := normalizedValue * criterion.NormalizedWeight
			if criterion.Attribute == criteria.AttributeCost {
				totalCost += weightedValue
			} else {
				totalBenefit += weightedValue
			}

			result.Scores = append(result.Scores, CriterionScoreResponse{
				CriterionID:      criterion.ID,
				Code:             criterion.Code,
				Name:             criterion.Name,
				Attribute:        criterion.Attribute,
				Weight:           criterion.Weight,
				NormalizedWeight: criterion.NormalizedWeight,
				RawValue:         rawValue,
				NormalizedValue:  normalizedValue,
				WeightedValue:    weightedValue,
			})
		}

		result.PreferenceValue = totalBenefit - totalCost
		results = append(results, result)
	}

	sort.SliceStable(results, func(i, j int) bool {
		if results[i].PreferenceValue == results[j].PreferenceValue {
			return results[i].Hotel.Name < results[j].Hotel.Name
		}

		return results[i].PreferenceValue > results[j].PreferenceValue
	})

	for index := range results {
		results[index].Rank = index + 1
	}

	return results, nil
}

// resolveHotelValue mengambil nilai hotel yang sesuai dengan kode atau nama kriteria.
func resolveHotelValue(hotel hotels.Hotel, code string, name string) (float64, error) {
	switch strings.ToUpper(strings.TrimSpace(code)) {
	case "C1":
		return hotel.Price, nil
	case "C2":
		return hotel.RatingFacility, nil
	case "C3":
		return hotel.Accessibility, nil
	case "C4":
		return hotel.LocationScore, nil
	case "C5":
		return hotel.ViewScore, nil
	}

	normalizedName := strings.ToLower(strings.TrimSpace(name))
	switch {
	case strings.Contains(normalizedName, "biaya") || strings.Contains(normalizedName, "harga"):
		return hotel.Price, nil
	case strings.Contains(normalizedName, "fasilitas") || strings.Contains(normalizedName, "rating"):
		return hotel.RatingFacility, nil
	case strings.Contains(normalizedName, "akses"):
		return hotel.Accessibility, nil
	case strings.Contains(normalizedName, "lokasi"):
		return hotel.LocationScore, nil
	case strings.Contains(normalizedName, "view"):
		return hotel.ViewScore, nil
	default:
		return 0, ErrUnsupportedCriterion
	}
}
