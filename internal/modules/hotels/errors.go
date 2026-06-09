package hotels

import "errors"

var (
	ErrHotelNotFound        = errors.New("hotel not found")
	ErrInvalidHotelPayload  = errors.New("invalid hotel payload")
	ErrHotelStillReferenced = errors.New("hotel is still referenced by another data")
)
