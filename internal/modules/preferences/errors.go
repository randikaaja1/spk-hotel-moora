package preferences

import "errors"

var (
	ErrPreferenceNotFound       = errors.New("preference not found")
	ErrInvalidPreferencePayload = errors.New("invalid preference payload")
	ErrPreferenceUserRequired   = errors.New("preference user is required")
)
