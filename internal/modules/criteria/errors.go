package criteria

import "errors"

var (
	ErrCriterionNotFound          = errors.New("criterion not found")
	ErrInvalidCriterionPayload    = errors.New("invalid criterion payload")
	ErrCriterionCodeAlreadyExists = errors.New("criterion code already exists")
)
