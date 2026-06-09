package hotels

import (
	"errors"
	"net/http"
	"strconv"

	"spk-hotel-moora-service-go/internal/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

// NewHandler membuat handler hotel untuk menerima request HTTP.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// List menangani request daftar hotel.
func (h *Handler) List(c *gin.Context) {
	result, err := h.service.List(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Hotels retrieved successfully", result)
}

// GetByID menangani request detail hotel.
func (h *Handler) GetByID(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	result, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Hotel retrieved successfully", result)
}

// Create menangani request pembuatan hotel baru.
func (h *Handler) Create(c *gin.Context) {
	var request SaveHotelRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid hotel request", []string{err.Error()})
		return
	}

	result, err := h.service.Create(c.Request.Context(), request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusCreated, "Hotel created successfully", result)
}

// Update menangani request perubahan data hotel.
func (h *Handler) Update(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	var request SaveHotelRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid hotel request", []string{err.Error()})
		return
	}

	result, err := h.service.Update(c.Request.Context(), id, request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Hotel updated successfully", result)
}

// Delete menangani request penghapusan hotel.
func (h *Handler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Hotel deleted successfully", gin.H{
		"id": id,
	})
}

// handleError mengubah error hotel menjadi response HTTP yang sesuai.
func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrInvalidHotelPayload):
		response.Error(c, http.StatusBadRequest, "INVALID_HOTEL_PAYLOAD", "Hotel data is invalid", []string{err.Error()})
	case errors.Is(err, ErrHotelNotFound):
		response.Error(c, http.StatusNotFound, "HOTEL_NOT_FOUND", "Hotel not found", []string{err.Error()})
	default:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Internal server error", []string{err.Error()})
	}
}

// parseIDParam membaca parameter id dari URL dan mengirim response jika nilainya tidak valid.
func parseIDParam(c *gin.Context, paramName string) (int64, bool) {
	id, err := strconv.ParseInt(c.Param(paramName), 10, 64)
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid id parameter", []string{"id must be a positive integer"})
		return 0, false
	}

	return id, true
}
