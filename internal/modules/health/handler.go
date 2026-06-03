package health

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"spk-hotel-moora-service-go/internal/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	db *sql.DB
}

// NewHandler membuat handler health check dengan dependency database.
func NewHandler(db *sql.DB) *Handler {
	return &Handler{
		db: db,
	}
}

// Check memeriksa status aplikasi dan koneksi database.
func (h *Handler) Check(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	if err := h.db.PingContext(ctx); err != nil {
		response.Error(
			c,
			http.StatusServiceUnavailable,
			"DATABASE_DISCONNECTED",
			"Service is running but database is unavailable",
			[]string{err.Error()},
		)
		return
	}

	response.Success(c, http.StatusOK, "Service is healthy", gin.H{
		"service":  "spk-hotel-moora-service-go",
		"database": "connected",
		"status":   "ok",
	})
}
