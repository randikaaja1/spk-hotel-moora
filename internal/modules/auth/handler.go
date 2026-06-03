package auth

import (
	"errors"
	"net/http"

	"spk-hotel-moora-service-go/internal/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

// NewHandler membuat handler auth untuk menerima request HTTP.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// Register menangani request registrasi user baru.
func (h *Handler) Register(c *gin.Context) {
	var request RegisterRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"VALIDATION_ERROR",
			"Invalid register request",
			[]string{err.Error()},
		)
		return
	}

	result, err := h.service.Register(c.Request.Context(), request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusCreated, "User registered successfully", result)
}

// Login menangani request login dan mengembalikan token JWT.
func (h *Handler) Login(c *gin.Context) {
	var request LoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"VALIDATION_ERROR",
			"Invalid login request",
			[]string{err.Error()},
		)
		return
	}

	result, err := h.service.Login(c.Request.Context(), request)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Login successful", result)
}

// Me mengembalikan data user berdasarkan token yang sedang digunakan.
func (h *Handler) Me(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		response.Error(
			c,
			http.StatusUnauthorized,
			"UNAUTHORIZED",
			"User token is required",
			[]string{"user_id not found in request context"},
		)
		return
	}

	userID, ok := userIDValue.(int64)
	if !ok {
		response.Error(
			c,
			http.StatusUnauthorized,
			"INVALID_TOKEN_CONTEXT",
			"Invalid token context",
			[]string{"user_id has invalid type"},
		)
		return
	}

	result, err := h.service.GetMe(c.Request.Context(), userID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Authenticated user retrieved successfully", result)
}

// handleError mengubah error dari service menjadi response HTTP yang sesuai.
func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrInvalidRegisterPayload):
		response.Error(
			c,
			http.StatusBadRequest,
			"INVALID_REGISTER_PAYLOAD",
			"Name, valid email, and password with minimum 6 characters are required",
			[]string{err.Error()},
		)

	case errors.Is(err, ErrInvalidLoginPayload):
		response.Error(
			c,
			http.StatusBadRequest,
			"INVALID_LOGIN_PAYLOAD",
			"Valid email and password are required",
			[]string{err.Error()},
		)

	case errors.Is(err, ErrEmailAlreadyRegistered):
		response.Error(
			c,
			http.StatusConflict,
			"EMAIL_ALREADY_REGISTERED",
			"Email is already registered",
			[]string{err.Error()},
		)

	case errors.Is(err, ErrInvalidCredentials):
		response.Error(
			c,
			http.StatusUnauthorized,
			"INVALID_CREDENTIALS",
			"Invalid email or password",
			[]string{err.Error()},
		)

	case errors.Is(err, ErrUserNotFound):
		response.Error(
			c,
			http.StatusNotFound,
			"USER_NOT_FOUND",
			"User not found",
			[]string{err.Error()},
		)

	default:
		response.Error(
			c,
			http.StatusInternalServerError,
			"INTERNAL_SERVER_ERROR",
			"Internal server error",
			[]string{err.Error()},
		)
	}
}
