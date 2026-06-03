package security

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"spk-hotel-moora-service-go/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken membuat JWT berdasarkan data user yang berhasil login.
func GenerateToken(userID int64, email string, role string, cfg *config.Config) (string, error) {
	now := time.Now()
	expiredAt := now.Add(time.Duration(cfg.JWTExpiresInHours) * time.Hour)

	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   strconv.FormatInt(userID, 10),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiredAt),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(cfg.JWTSecret))
}

// ValidateToken memvalidasi JWT dan mengembalikan claims user jika token valid.
func ValidateToken(tokenString string, cfg *config.Config) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}

		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.UserID == 0 && claims.Subject != "" {
		userID, err := strconv.ParseInt(claims.Subject, 10, 64)
		if err == nil {
			claims.UserID = userID
		}
	}

	return claims, nil
}
