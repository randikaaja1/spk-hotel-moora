package server

import (
	"database/sql"
	"net/http"

	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/middleware"
	"spk-hotel-moora-service-go/internal/modules/health"
	"spk-hotel-moora-service-go/internal/response"

	"github.com/gin-gonic/gin"
)

// SetupRouter menyiapkan router utama, middleware, dan seluruh route API.
func SetupRouter(db *sql.DB, cfg *config.Config) *gin.Engine {
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.CORSMiddleware(cfg))

	healthHandler := health.NewHandler(db)

	health.RegisterRoutes(router, healthHandler)

	api := router.Group("/api/v1")
	health.RegisterRoutes(api, healthHandler)

	router.NoRoute(func(c *gin.Context) {
		response.Error(
			c,
			http.StatusNotFound,
			"ROUTE_NOT_FOUND",
			"Route not found",
			[]string{"The requested endpoint does not exist"},
		)
	})

	return router
}