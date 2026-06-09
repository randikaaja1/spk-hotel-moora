package hotels

import (
	"context"
	"strings"
)

type Service struct {
	repository *Repository
}

// NewService membuat service hotel untuk validasi dan orkestrasi data alternatif.
func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

// List mengambil seluruh hotel yang tersedia.
func (s *Service) List(ctx context.Context) ([]HotelResponse, error) {
	items, err := s.repository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	return ToResponses(items), nil
}

// GetByID mengambil detail hotel berdasarkan id.
func (s *Service) GetByID(ctx context.Context, id int64) (*HotelResponse, error) {
	hotel, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := hotel.ToResponse()

	return &response, nil
}

// Create memvalidasi payload lalu menyimpan hotel baru.
func (s *Service) Create(ctx context.Context, request SaveHotelRequest) (*HotelResponse, error) {
	hotel, err := buildHotelFromRequest(request)
	if err != nil {
		return nil, err
	}

	if err := s.repository.Create(ctx, hotel); err != nil {
		return nil, err
	}

	createdHotel, err := s.repository.FindByID(ctx, hotel.ID)
	if err != nil {
		return nil, err
	}

	response := createdHotel.ToResponse()

	return &response, nil
}

// Update memvalidasi payload lalu memperbarui hotel yang sudah ada.
func (s *Service) Update(ctx context.Context, id int64, request SaveHotelRequest) (*HotelResponse, error) {
	hotel, err := buildHotelFromRequest(request)
	if err != nil {
		return nil, err
	}

	hotel.ID = id

	if err := s.repository.Update(ctx, hotel); err != nil {
		return nil, err
	}

	updatedHotel, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := updatedHotel.ToResponse()

	return &response, nil
}

// Delete menghapus hotel jika data ditemukan.
func (s *Service) Delete(ctx context.Context, id int64) error {
	return s.repository.Delete(ctx, id)
}

// buildHotelFromRequest membentuk model Hotel dari payload yang sudah divalidasi.
func buildHotelFromRequest(request SaveHotelRequest) (*Hotel, error) {
	name := strings.TrimSpace(request.Name)
	description := strings.TrimSpace(request.Description)

	if name == "" ||
		request.Price <= 0 ||
		!isScoreInRange(request.RatingFacility) ||
		!isScoreInRange(request.Accessibility) ||
		request.DistanceKM < 0 ||
		!isScoreInRange(request.LocationScore) ||
		!isScoreInRange(request.ViewScore) {
		return nil, ErrInvalidHotelPayload
	}

	return &Hotel{
		Name:           name,
		Price:          request.Price,
		RatingFacility: request.RatingFacility,
		Accessibility:  request.Accessibility,
		DistanceKM:     request.DistanceKM,
		LocationScore:  request.LocationScore,
		ViewScore:      request.ViewScore,
		Description:    description,
	}, nil
}

// isScoreInRange memastikan nilai kriteria berbasis skor berada pada rentang 0 sampai 5.
func isScoreInRange(value float64) bool {
	return value >= 0 && value <= 5
}
