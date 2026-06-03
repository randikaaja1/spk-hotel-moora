package middleware

import (
	"net/http"
	"strings"
	"time"

	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/security"

	"github.com/gin-gonic/gin"
)

// AuthRequired memastikan request memiliki Bearer token yang valid.
func AuthRequired(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := extractBearerToken(c.GetHeader("Authorization"))
		if tokenString == "" {
			abortWithAuthError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Authorization token is required")
			return
		}

		claims, err := security.ValidateToken(tokenString, cfg)
		if err != nil {
			abortWithAuthError(c, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid or expired token")
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// RequireRoles membatasi akses endpoint berdasarkan role user.
func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	allowedRoleMap := make(map[string]bool)

	for _, role := range allowedRoles {
		allowedRoleMap[role] = true
	}

	return func(c *gin.Context) {
		role := c.GetString("user_role")
		if role == "" {
			abortWithAuthError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User role is missing")
			return
		}

		if !allowedRoleMap[role] {
			abortWithAuthError(c, http.StatusForbidden, "FORBIDDEN", "You do not have permission to access this resource")
			return
		}

		c.Next()
	}
}

// extractBearerToken mengambil token dari header Authorization.
func extractBearerToken(authorizationHeader string) string {
	if authorizationHeader == "" {
		return ""
	}

	parts := strings.SplitN(authorizationHeader, " ", 2)
	if len(parts) != 2 {
		return ""
	}

	if strings.ToLower(parts[0]) != "bearer" {
		return ""
	}

	return strings.TrimSpace(parts[1])
}

// abortWithAuthError menghentikan request auth dengan format response standar.
func abortWithAuthError(c *gin.Context, statusCode int, code string, message string) {
	requestID := c.GetString(RequestIDKey)
	if requestID == "" {
		requestID = c.GetHeader("X-Request-ID")
	}

	c.AbortWithStatusJSON(statusCode, gin.H{
		"success": false,
		"message": message,
		"error": gin.H{
			"code":    code,
			"details": []string{message},
		},
		"meta": gin.H{
			"request_id": requestID,
			"timestamp":  time.Now(),
		},
	})
}
