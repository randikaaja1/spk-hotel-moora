package users

import (
	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/middleware"
	"spk-hotel-moora-service-go/internal/modules/auth"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes mendaftarkan endpoint pengelolaan pengguna untuk admin.
func RegisterRoutes(router gin.IRouter, handler *Handler, cfg *config.Config) {
	protected := router.Group("")
	protected.Use(middleware.AuthRequired(cfg))
	protected.Use(middleware.RequireRoles(auth.RoleAdmin))

	protected.GET("", handler.List)
	protected.PATCH("/:id/role", handler.UpdateRole)
	protected.PATCH("/:id/status", handler.UpdateStatus)
}
