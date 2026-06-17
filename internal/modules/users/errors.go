package users

import "errors"

var (
	ErrInvalidUserPayload = errors.New("invalid user payload")
	ErrSelfActionBlocked  = errors.New("cannot change own role or active status")
	ErrUserNotFound       = errors.New("user not found")
)
