package server

import (
	"database/sql"
	"net/http"

	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/middleware"
	"spk-hotel-moora-service-go/internal/modules/auth"
	"spk-hotel-moora-service-go/internal/modules/criteria"
	"spk-hotel-moora-service-go/internal/modules/dashboard"
	"spk-hotel-moora-service-go/internal/modules/health"
	"spk-hotel-moora-service-go/internal/modules/hotels"
	"spk-hotel-moora-service-go/internal/modules/preferences"
	"spk-hotel-moora-service-go/internal/modules/recommendations"
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

	authRepository := auth.NewRepository(db)
	authService := auth.NewService(authRepository, cfg)
	authHandler := auth.NewHandler(authService)

	criterionRepository := criteria.NewRepository(db)
	criterionService := criteria.NewService(criterionRepository)
	criterionHandler := criteria.NewHandler(criterionService)

	hotelRepository := hotels.NewRepository(db)
	hotelService := hotels.NewService(hotelRepository, criterionRepository)
	hotelHandler := hotels.NewHandler(hotelService)

	preferenceRepository := preferences.NewRepository(db)
	preferenceService := preferences.NewService(preferenceRepository)
	preferenceHandler := preferences.NewHandler(preferenceService)

	recommendationRepository := recommendations.NewRepository(db)
	recommendationService := recommendations.NewService(
		recommendationRepository,
		hotelRepository,
		criterionRepository,
		preferenceRepository,
	)
	recommendationHandler := recommendations.NewHandler(recommendationService)

	dashboardRepository := dashboard.NewRepository(db)
	dashboardService := dashboard.NewService(
		dashboardRepository,
		hotelRepository,
		criterionRepository,
		recommendationRepository,
	)
	dashboardHandler := dashboard.NewHandler(dashboardService)

	health.RegisterRoutes(router, healthHandler)

	api := router.Group("/api/v1")
	health.RegisterRoutes(api, healthHandler)
	auth.RegisterRoutes(api.Group("/auth"), authHandler, cfg)
	hotels.RegisterRoutes(api.Group("/hotels"), hotelHandler, cfg)
	criteria.RegisterRoutes(api.Group("/criteria"), criterionHandler, cfg)
	preferences.RegisterRoutes(api.Group("/preferences"), preferenceHandler, cfg)
	recommendations.RegisterRoutes(api.Group("/recommendations"), recommendationHandler, cfg)
	dashboard.RegisterRoutes(api.Group("/dashboard"), dashboardHandler, cfg)

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
