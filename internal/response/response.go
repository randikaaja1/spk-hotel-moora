package response

import (
	"time"

	"github.com/gin-gonic/gin"
)

type Meta struct {
	RequestID string    `json:"request_id"`
	Timestamp time.Time `json:"timestamp"`
}

type APIError struct {
	Code    string   `json:"code"`
	Details []string `json:"details,omitempty"`
}

type APIResponse struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    any       `json:"data,omitempty"`
	Error   *APIError `json:"error,omitempty"`
	Meta    Meta      `json:"meta"`
}

// Success mengirim response sukses dengan format standar API.
func Success(c *gin.Context, statusCode int, message string, data any) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    buildMeta(c),
	})
}

// Error mengirim response gagal dengan format standar API.
func Error(c *gin.Context, statusCode int, code string, message string, details []string) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Message: message,
		Error: &APIError{
			Code:    code,
			Details: details,
		},
		Meta: buildMeta(c),
	})
}

// buildMeta membentuk metadata response seperti request ID dan timestamp.
func buildMeta(c *gin.Context) Meta {
	requestID := c.GetString("request_id")

	if requestID == "" {
		requestID = c.GetHeader("X-Request-ID")
	}

	return Meta{
		RequestID: requestID,
		Timestamp: time.Now(),
	}
}
