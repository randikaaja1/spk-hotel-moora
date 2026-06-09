package preferences

import "context"

type Service struct {
	repository *Repository
}

// NewService membuat service preferensi untuk validasi filter user.
func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

// Save memvalidasi dan menyimpan preferensi terakhir user.
func (s *Service) Save(ctx context.Context, userID int64, request SavePreferenceRequest) (*PreferenceResponse, error) {
	if userID <= 0 {
		return nil, ErrPreferenceUserRequired
	}

	filter, err := BuildFilterFromRequest(request, true)
	if err != nil {
		return nil, err
	}

	preference := &Preference{
		UserID:           userID,
		MaxBudget:        filter.MaxBudget,
		MinRating:        filter.MinRating,
		MinAccessibility: filter.MinAccessibility,
		MaxDistance:      filter.MaxDistance,
		MinView:          filter.MinView,
	}

	if err := s.repository.Upsert(ctx, preference); err != nil {
		return nil, err
	}

	savedPreference, err := s.repository.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	response := savedPreference.ToResponse()

	return &response, nil
}

// GetLatest mengambil preferensi terakhir user.
func (s *Service) GetLatest(ctx context.Context, userID int64) (*PreferenceResponse, error) {
	if userID <= 0 {
		return nil, ErrPreferenceUserRequired
	}

	preference, err := s.repository.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	response := preference.ToResponse()

	return &response, nil
}

// BuildFilterFromRequest membuat filter preferensi dan dapat mewajibkan minimal satu field terisi.
func BuildFilterFromRequest(request SavePreferenceRequest, requireAny bool) (*PreferenceFilter, error) {
	if !isValidMoneyLimit(request.MaxBudget) ||
		!isValidScoreLimit(request.MinRating) ||
		!isValidScoreLimit(request.MinAccessibility) ||
		!isValidDistanceLimit(request.MaxDistance) ||
		!isValidScoreLimit(request.MinView) {
		return nil, ErrInvalidPreferencePayload
	}

	if requireAny && !hasAnyPreference(request) {
		return nil, ErrInvalidPreferencePayload
	}

	return &PreferenceFilter{
		MaxBudget:        request.MaxBudget,
		MinRating:        request.MinRating,
		MinAccessibility: request.MinAccessibility,
		MaxDistance:      request.MaxDistance,
		MinView:          request.MinView,
	}, nil
}

// isValidMoneyLimit memastikan batas nominal tidak bernilai negatif.
func isValidMoneyLimit(value *float64) bool {
	return value == nil || *value >= 0
}

// isValidDistanceLimit memastikan batas jarak tidak bernilai negatif.
func isValidDistanceLimit(value *float64) bool {
	return value == nil || *value >= 0
}

// isValidScoreLimit memastikan batas skor berada pada rentang 0 sampai 5.
func isValidScoreLimit(value *float64) bool {
	return value == nil || (*value >= 0 && *value <= 5)
}

// hasAnyPreference memastikan payload preferensi memiliki minimal satu filter.
func hasAnyPreference(request SavePreferenceRequest) bool {
	return request.MaxBudget != nil ||
		request.MinRating != nil ||
		request.MinAccessibility != nil ||
		request.MaxDistance != nil ||
		request.MinView != nil
}
