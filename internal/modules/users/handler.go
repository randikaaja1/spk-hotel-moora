package users

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

// NewHandler membuat handler pengguna untuk menerima request admin.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// List menangani request daftar pengguna.
func (h *Handler) List(c *gin.Context) {
	result, err := h.service.List(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Users retrieved successfully", result)
}

// UpdateRole menangani request perubahan role pengguna.
func (h *Handler) UpdateRole(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	var request UpdateRoleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid role request", []string{err.Error()})
		return
	}

	result, err := h.service.UpdateRole(c.Request.Context(), getCurrentUserID(c), id, request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "User role updated successfully", result)
}

// UpdateStatus menangani request aktivasi atau deaktivasi pengguna.
func (h *Handler) UpdateStatus(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	var request UpdateStatusRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid status request", []string{err.Error()})
		return
	}

	result, err := h.service.UpdateStatus(c.Request.Context(), getCurrentUserID(c), id, request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "User status updated successfully", result)
}

// handleError mengubah error pengguna menjadi response HTTP yang sesuai.
func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrInvalidUserPayload):
		response.Error(c, http.StatusBadRequest, "INVALID_USER_PAYLOAD", "User data is invalid", []string{err.Error()})
	case errors.Is(err, ErrSelfActionBlocked):
		response.Error(c, http.StatusForbidden, "SELF_ACTION_BLOCKED", "Cannot change your own role or status", []string{err.Error()})
	case errors.Is(err, ErrUserNotFound):
		response.Error(c, http.StatusNotFound, "USER_NOT_FOUND", "User not found", []string{err.Error()})
	default:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Internal server error", []string{err.Error()})
	}
}

// getCurrentUserID mengambil user id admin dari context JWT.
func getCurrentUserID(c *gin.Context) int64 {
	userID, _ := c.Get("user_id")
	value, _ := userID.(int64)

	return value
}

// parseIDParam membaca parameter id pengguna dari URL.
func parseIDParam(c *gin.Context, paramName string) (int64, bool) {
	id, err := strconv.ParseInt(c.Param(paramName), 10, 64)
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid id parameter", []string{"id must be a positive integer"})
		return 0, false
	}

	return id, true
}
