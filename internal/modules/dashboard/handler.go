package dashboard

import (
	"net/http"

	"spk-hotel-moora-service-go/internal/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

// NewHandler membuat handler dashboard untuk menerima request HTTP.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// Summary menangani request ringkasan dashboard admin.
func (h *Handler) Summary(c *gin.Context) {
	result, err := h.service.GetSummary(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Internal server error", []string{err.Error()})
		return
	}

	response.Success(c, http.StatusOK, "Dashboard summary retrieved successfully", result)
}
