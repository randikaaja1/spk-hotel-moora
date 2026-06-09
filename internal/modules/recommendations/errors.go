package recommendations

import "errors"

var (
	ErrInvalidCalculationPayload = errors.New("invalid calculation payload")
	ErrRecommendationNotFound    = errors.New("recommendation result not found")
	ErrRecommendationUserMissing = errors.New("recommendation user is required")
	ErrNoHotelsAvailable         = errors.New("no hotels available")
	ErrNoCriteriaAvailable       = errors.New("no criteria available")
	ErrNoEligibleHotels          = errors.New("no hotels match preference filter")
	ErrInvalidCriteriaWeight     = errors.New("criteria total weight must be greater than zero")
	ErrUnsupportedCriterion      = errors.New("unsupported criterion code or name")
)
