package preferences

import (
	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/middleware"
	"spk-hotel-moora-service-go/internal/modules/auth"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes mendaftarkan endpoint preferensi user ke router API.
func RegisterRoutes(router gin.IRouter, handler *Handler, cfg *config.Config) {
	protected := router.Group("")
	protected.Use(middleware.AuthRequired(cfg))
	protected.Use(middleware.RequireRoles(auth.RoleUser))

	protected.POST("", handler.Save)
	protected.GET("/latest", handler.GetLatest)
}
