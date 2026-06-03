package auth

import "errors"

var (
	ErrUserNotFound           = errors.New("user not found")
	ErrEmailAlreadyRegistered = errors.New("email already registered")
	ErrInvalidCredentials     = errors.New("invalid email or password")
	ErrInvalidRegisterPayload = errors.New("invalid register payload")
	ErrInvalidLoginPayload    = errors.New("invalid login payload")
)
