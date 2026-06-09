package criteria

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

// NewHandler membuat handler kriteria untuk menerima request HTTP.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// List menangani request daftar kriteria.
func (h *Handler) List(c *gin.Context) {
	result, err := h.service.List(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Criteria retrieved successfully", result)
}

// GetByID menangani request detail kriteria.
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

	response.Success(c, http.StatusOK, "Criterion retrieved successfully", result)
}

// Create menangani request pembuatan kriteria.
func (h *Handler) Create(c *gin.Context) {
	var request SaveCriterionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid criterion request", []string{err.Error()})
		return
	}

	result, err := h.service.Create(c.Request.Context(), request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusCreated, "Criterion created successfully", result)
}

// Update menangani request perubahan kriteria.
func (h *Handler) Update(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	var request SaveCriterionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid criterion request", []string{err.Error()})
		return
	}

	result, err := h.service.Update(c.Request.Context(), id, request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Criterion updated successfully", result)
}

// Delete menangani request penghapusan kriteria.
func (h *Handler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Criterion deleted successfully", gin.H{
		"id": id,
	})
}

// handleError mengubah error kriteria menjadi response HTTP yang sesuai.
func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrInvalidCriterionPayload):
		response.Error(c, http.StatusBadRequest, "INVALID_CRITERION_PAYLOAD", "Criterion data is invalid", []string{err.Error()})
	case errors.Is(err, ErrCriterionCodeAlreadyExists):
		response.Error(c, http.StatusConflict, "CRITERION_CODE_ALREADY_EXISTS", "Criterion code already exists", []string{err.Error()})
	case errors.Is(err, ErrCriterionNotFound):
		response.Error(c, http.StatusNotFound, "CRITERION_NOT_FOUND", "Criterion not found", []string{err.Error()})
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
