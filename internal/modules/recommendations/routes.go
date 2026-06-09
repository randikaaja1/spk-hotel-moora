package recommendations

import (
	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes mendaftarkan endpoint rekomendasi MOORA ke router API.
func RegisterRoutes(router gin.IRouter, handler *Handler, cfg *config.Config) {
	protected := router.Group("")
	protected.Use(middleware.AuthRequired(cfg))

	protected.POST("/calculate", handler.Calculate)
	protected.GET("/latest", handler.GetLatest)
}
