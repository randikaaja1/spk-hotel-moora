package hotels

import (
	"context"
	"net/url"
	"strings"

	"spk-hotel-moora-service-go/internal/modules/criteria"
)

type Service struct {
	repository          *Repository
	criterionRepository *criteria.Repository
}

// NewService membuat service hotel untuk validasi dan orkestrasi data alternatif.
func NewService(repository *Repository, criterionRepository *criteria.Repository) *Service {
	return &Service{
		repository:          repository,
		criterionRepository: criterionRepository,
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
	criterionItems, err := s.criterionRepository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	hotel, err := buildHotelFromRequest(request, criterionItems)
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
	criterionItems, err := s.criterionRepository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	hotel, err := buildHotelFromRequest(request, criterionItems)
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
func buildHotelFromRequest(request SaveHotelRequest, criterionItems []criteria.Criterion) (*Hotel, error) {
	name := strings.TrimSpace(request.Name)
	description := strings.TrimSpace(request.Description)
	googleMapsURL := strings.TrimSpace(request.GoogleMapsURL)
	criterionValues, err := buildCriterionValuesFromRequest(request, criterionItems)
	if err != nil {
		return nil, err
	}

	hotel := &Hotel{
		Name:            name,
		Price:           request.Price,
		RatingFacility:  request.RatingFacility,
		Accessibility:   request.Accessibility,
		DistanceKM:      request.DistanceKM,
		GoogleMapsURL:   googleMapsURL,
		LocationScore:   request.LocationScore,
		ViewScore:       request.ViewScore,
		Description:     description,
		CriterionValues: criterionValues,
	}

	applyCriterionValuesToLegacyFields(hotel)

	if name == "" ||
		hotel.Price <= 0 ||
		(hotel.GoogleMapsURL != "" && !isValidLocationURL(hotel.GoogleMapsURL)) ||
		!isOptionalScoreInRange(hotel.RatingFacility) ||
		!isOptionalScoreInRange(hotel.Accessibility) ||
		hotel.DistanceKM <= 0 ||
		!isOptionalScoreInRange(hotel.LocationScore) ||
		!isOptionalScoreInRange(hotel.ViewScore) {
		return nil, ErrInvalidHotelPayload
	}

	return hotel, nil
}

// isValidLocationURL memastikan lokasi hotel diisi dalam format URL yang dapat dibuka.
func isValidLocationURL(value string) bool {
	parsedURL, err := url.ParseRequestURI(value)
	if err != nil {
		return false
	}

	return parsedURL.Scheme == "http" || parsedURL.Scheme == "https"
}

// buildCriterionValuesFromRequest menyusun nilai hotel untuk seluruh kriteria aktif.
func buildCriterionValuesFromRequest(request SaveHotelRequest, criterionItems []criteria.Criterion) ([]HotelCriterionValue, error) {
	if len(criterionItems) == 0 {
		return nil, ErrInvalidHotelPayload
	}

	inputValues := make(map[int64]float64, len(request.CriterionValues))
	for _, item := range request.CriterionValues {
		if item.CriterionID <= 0 {
			return nil, ErrInvalidHotelPayload
		}

		if _, exists := inputValues[item.CriterionID]; exists {
			return nil, ErrInvalidHotelPayload
		}

		inputValues[item.CriterionID] = item.Value
	}

	values := make([]HotelCriterionValue, 0, len(criterionItems))
	for _, criterion := range criterionItems {
		value, ok := inputValues[criterion.ID]
		if !ok {
			value = legacyCriterionValueFromRequest(request, criterion)
		}

		if !isValidCriterionValue(criterion, value) {
			return nil, ErrInvalidHotelPayload
		}

		values = append(values, HotelCriterionValue{
			CriterionID: criterion.ID,
			Code:        criterion.Code,
			Name:        criterion.Name,
			Attribute:   criterion.Attribute,
			Value:       value,
		})
	}

	return values, nil
}

// legacyCriterionValueFromRequest menjaga kompatibilitas payload lama berdasarkan kode atau nama kriteria.
func legacyCriterionValueFromRequest(request SaveHotelRequest, criterion criteria.Criterion) float64 {
	switch legacyCriterionKey(criterion.Code, criterion.Name) {
	case "price":
		return request.Price
	case "rating":
		return request.RatingFacility
	case "accessibility":
		return request.Accessibility
	case "distance":
		return request.DistanceKM
	case "location":
		return request.LocationScore
	case "view":
		return request.ViewScore
	default:
		return 0
	}
}

// applyCriterionValuesToLegacyFields menyinkronkan field lama agar fitur filter dan tampilan tetap berjalan.
func applyCriterionValuesToLegacyFields(hotel *Hotel) {
	for _, item := range hotel.CriterionValues {
		switch legacyCriterionKey(item.Code, item.Name) {
		case "price":
			hotel.Price = item.Value
		case "rating":
			hotel.RatingFacility = item.Value
		case "accessibility":
			hotel.Accessibility = item.Value
		case "distance":
			hotel.DistanceKM = item.Value
		case "location":
			hotel.LocationScore = item.Value
		case "view":
			hotel.ViewScore = item.Value
		}
	}
}

// legacyCriterionKey mengenali kriteria default dari kode atau nama agar data lama tetap kompatibel.
func legacyCriterionKey(code string, name string) string {
	normalizedCode := strings.ToUpper(strings.TrimSpace(code))
	switch normalizedCode {
	case "C1":
		return "price"
	case "C2":
		return "rating"
	case "C3":
		return "accessibility"
	case "C4":
		return "distance"
	case "C5":
		return "view"
	}

	normalizedName := strings.ToLower(strings.TrimSpace(name))
	switch {
	case strings.Contains(normalizedName, "biaya") || strings.Contains(normalizedName, "harga"):
		return "price"
	case strings.Contains(normalizedName, "fasilitas") || strings.Contains(normalizedName, "rating"):
		return "rating"
	case strings.Contains(normalizedName, "akses"):
		return "accessibility"
	case strings.Contains(normalizedName, "jarak"):
		return "distance"
	case strings.Contains(normalizedName, "lokasi"):
		return "location"
	case strings.Contains(normalizedName, "view"):
		return "view"
	default:
		return ""
	}
}

// isValidCriterionValue memastikan nilai kriteria tidak negatif dan field default tetap sesuai rentang.
func isValidCriterionValue(criterion criteria.Criterion, value float64) bool {
	if value < 0 {
		return false
	}

	switch legacyCriterionKey(criterion.Code, criterion.Name) {
	case "price":
		return value > 0
	case "distance":
		return value > 0
	case "rating", "accessibility", "location", "view":
		return isScoreInRange(value)
	default:
		return true
	}
}

// isOptionalScoreInRange memastikan field skor lama tetap valid saat nilainya tersedia.
func isOptionalScoreInRange(value float64) bool {
	return value == 0 || isScoreInRange(value)
}

// isScoreInRange memastikan nilai kriteria berbasis skor berada pada rentang 0 sampai 5.
func isScoreInRange(value float64) bool {
	return value >= 0 && value <= 5
}
