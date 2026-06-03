package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv  string
	AppPort string

	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBParseTime string
	DBLoc       string

	CORSAllowedOrigins []string

	JWTSecret         string
	JWTExpiresInHours int
}

// Load membaca konfigurasi aplikasi dari file .env dan environment variable.
func Load() (*Config, error) {
	_ = godotenv.Load()

	jwtExpiry, err := strconv.Atoi(getEnv("JWT_EXPIRES_IN_HOURS", "24"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRES_IN_HOURS value: %w", err)
	}

	cfg := &Config{
		AppEnv:  getEnv("APP_ENV", "development"),
		AppPort: getEnv("APP_PORT", "8080"),

		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "3307"),
		DBUser:      getEnv("DB_USER", "moora_user"),
		DBPassword:  getEnv("DB_PASSWORD", "moora_password"),
		DBName:      getEnv("DB_NAME", "spk_hotel_moora_db"),
		DBParseTime: getEnv("DB_PARSE_TIME", "true"),
		DBLoc:       getEnv("DB_LOC", "Local"),

		CORSAllowedOrigins: parseCSVEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"),

		JWTSecret:         getEnv("JWT_SECRET", "change-this-secret-key"),
		JWTExpiresInHours: jwtExpiry,
	}

	return cfg, nil
}

// DSN membentuk connection string MySQL berdasarkan konfigurasi database.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=%s&loc=%s",
		c.DBUser,
		c.DBPassword,
		c.DBHost,
		c.DBPort,
		c.DBName,
		c.DBParseTime,
		url.QueryEscape(c.DBLoc),
	)
}

// getEnv mengambil nilai environment variable atau memakai default jika kosong.
func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

// parseCSVEnv mengubah environment variable berbentuk koma menjadi slice string.
func parseCSVEnv(key string, fallback string) []string {
	rawValue := getEnv(key, fallback)
	items := strings.Split(rawValue, ",")

	result := make([]string, 0, len(items))
	for _, item := range items {
		trimmed := strings.TrimSpace(item)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}

	return result
}
