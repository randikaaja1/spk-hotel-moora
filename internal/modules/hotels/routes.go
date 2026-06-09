package hotels

import (
	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/middleware"
	"spk-hotel-moora-service-go/internal/modules/auth"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes mendaftarkan endpoint hotel ke router API.
func RegisterRoutes(router gin.IRouter, handler *Handler, cfg *config.Config) {
	protected := router.Group("")
	protected.Use(middleware.AuthRequired(cfg))

	protected.GET("", handler.List)
	protected.GET("/:id", handler.GetByID)

	adminOnly := protected.Group("")
	adminOnly.Use(middleware.RequireRoles(auth.RoleAdmin))
	adminOnly.POST("", handler.Create)
	adminOnly.PUT("/:id", handler.Update)
	adminOnly.DELETE("/:id", handler.Delete)
}
