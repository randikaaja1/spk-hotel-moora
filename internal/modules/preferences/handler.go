package preferences

import (
	"errors"
	"net/http"

	"spk-hotel-moora-service-go/internal/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

// NewHandler membuat handler preferensi untuk menerima request HTTP.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// Save menangani request penyimpanan preferensi user.
func (h *Handler) Save(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		return
	}

	var request SavePreferenceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid preference request", []string{err.Error()})
		return
	}

	result, err := h.service.Save(c.Request.Context(), userID, request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Preference saved successfully", result)
}

// GetLatest menangani request pengambilan preferensi terakhir user.
func (h *Handler) GetLatest(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		return
	}

	result, err := h.service.GetLatest(c.Request.Context(), userID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Latest preference retrieved successfully", result)
}

// handleError mengubah error preferensi menjadi response HTTP yang sesuai.
func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrInvalidPreferencePayload):
		response.Error(c, http.StatusBadRequest, "INVALID_PREFERENCE_PAYLOAD", "Preference data is invalid", []string{err.Error()})
	case errors.Is(err, ErrPreferenceUserRequired):
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "User token is required", []string{err.Error()})
	case errors.Is(err, ErrPreferenceNotFound):
		response.Error(c, http.StatusNotFound, "PREFERENCE_NOT_FOUND", "Preference not found", []string{err.Error()})
	default:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Internal server error", []string{err.Error()})
	}
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
