package auth

import (
	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes mendaftarkan endpoint auth ke router API.
func RegisterRoutes(router gin.IRouter, handler *Handler, cfg *config.Config) {
	router.POST("/register", handler.Register)
	router.POST("/login", handler.Login)
	router.GET("/me", middleware.AuthRequired(cfg), handler.Me)
}
