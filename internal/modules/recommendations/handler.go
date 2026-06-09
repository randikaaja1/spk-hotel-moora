package recommendations

import (
	"errors"
	"io"
	"net/http"

	"spk-hotel-moora-service-go/internal/modules/preferences"
	"spk-hotel-moora-service-go/internal/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

// NewHandler membuat handler rekomendasi untuk menerima request HTTP.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// Calculate menangani request perhitungan ranking MOORA.
func (h *Handler) Calculate(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		return
	}

	var request CalculateRequest
	if ok := bindCalculateRequest(c, &request); !ok {
		return
	}

	result, err := h.service.Calculate(c.Request.Context(), userID, c.GetString("user_role"), request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Recommendation calculated successfully", result)
}

// GetLatest menangani request pengambilan hasil rekomendasi terakhir.
func (h *Handler) GetLatest(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		return
	}

	result, err := h.service.GetLatest(c.Request.Context(), userID, c.GetString("user_role"))
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Latest recommendation retrieved successfully", result)
}

// handleError mengubah error rekomendasi menjadi response HTTP yang sesuai.
func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrInvalidCalculationPayload):
		response.Error(c, http.StatusBadRequest, "INVALID_CALCULATION_PAYLOAD", "Calculation request is invalid", []string{err.Error()})
	case errors.Is(err, preferences.ErrInvalidPreferencePayload):
		response.Error(c, http.StatusBadRequest, "INVALID_PREFERENCE_PAYLOAD", "Preference data is invalid", []string{err.Error()})
	case errors.Is(err, ErrNoHotelsAvailable):
		response.Error(c, http.StatusBadRequest, "NO_HOTELS_AVAILABLE", "No hotels are available for calculation", []string{err.Error()})
	case errors.Is(err, ErrNoCriteriaAvailable):
		response.Error(c, http.StatusBadRequest, "NO_CRITERIA_AVAILABLE", "No criteria are available for calculation", []string{err.Error()})
	case errors.Is(err, ErrNoEligibleHotels):
		response.Error(c, http.StatusBadRequest, "NO_ELIGIBLE_HOTELS", "No hotels match the preference filter", []string{err.Error()})
	case errors.Is(err, ErrInvalidCriteriaWeight):
		response.Error(c, http.StatusBadRequest, "INVALID_CRITERIA_WEIGHT", "Criteria total weight must be greater than zero", []string{err.Error()})
	case errors.Is(err, ErrUnsupportedCriterion):
		response.Error(c, http.StatusBadRequest, "UNSUPPORTED_CRITERION", "Criterion is not mapped to a hotel value", []string{err.Error()})
	case errors.Is(err, ErrRecommendationNotFound):
		response.Error(c, http.StatusNotFound, "RECOMMENDATION_NOT_FOUND", "Recommendation result not found", []string{err.Error()})
	case errors.Is(err, ErrRecommendationUserMissing):
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "User token is required", []string{err.Error()})
	default:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Internal server error", []string{err.Error()})
	}
}

// bindCalculateRequest membaca body JSON opsional pada endpoint calculate.
func bindCalculateRequest(c *gin.Context, request *CalculateRequest) bool {
	if c.Request.Body == nil || c.Request.ContentLength == 0 {
		return true
	}

	if err := c.ShouldBindJSON(request); err != nil {
		if errors.Is(err, io.EOF) {
			return true
		}

		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid calculation request", []string{err.Error()})
		return false
	}

	return true
}

// getUserID mengambil user_id dari context JWT.
func getUserID(c *gin.Context) (int64, bool) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "User token is required", []string{"user_id not found in request context"})
		return 0, false
	}

	userID, ok := userIDValue.(int64)
	if !ok || userID <= 0 {
		response.Error(c, http.StatusUnauthorized, "INVALID_TOKEN_CONTEXT", "Invalid token context", []string{"user_id has invalid type"})
		return 0, false
	}

	return userID, true
}
