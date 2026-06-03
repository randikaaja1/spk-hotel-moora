package health

import "github.com/gin-gonic/gin"

// RegisterRoutes mendaftarkan endpoint health check ke router.
func RegisterRoutes(router gin.IRouter, handler *Handler) {
	router.GET("/health", handler.Check)
}