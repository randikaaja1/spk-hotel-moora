package criteria

import (
	"context"
	"strings"
)

type Service struct {
	repository *Repository
}

// NewService membuat service kriteria untuk validasi dan normalisasi bobot.
func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

// List mengambil seluruh kriteria.
func (s *Service) List(ctx context.Context) ([]CriterionResponse, error) {
	items, err := s.repository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	return ToResponses(items), nil
}

// GetByID mengambil detail kriteria berdasarkan id.
func (s *Service) GetByID(ctx context.Context, id int64) (*CriterionResponse, error) {
	item, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := item.ToResponse()

	return &response, nil
}

// Create memvalidasi payload lalu menyimpan kriteria baru.
func (s *Service) Create(ctx context.Context, request SaveCriterionRequest) (*CriterionResponse, error) {
	item, err := buildCriterionFromRequest(request)
	if err != nil {
		return nil, err
	}

	exists, err := s.repository.CodeExists(ctx, item.Code, 0)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, ErrCriterionCodeAlreadyExists
	}

	if err := s.repository.Create(ctx, item); err != nil {
		return nil, err
	}

	if err := s.repository.EnsureHotelValues(ctx, item.ID, 0); err != nil {
		return nil, err
	}

	if err := s.repository.NormalizeWeights(ctx); err != nil {
		return nil, err
	}

	createdCriterion, err := s.repository.FindByID(ctx, item.ID)
	if err != nil {
		return nil, err
	}

	response := createdCriterion.ToResponse()

	return &response, nil
}

// Update memvalidasi payload lalu memperbarui kriteria.
func (s *Service) Update(ctx context.Context, id int64, request SaveCriterionRequest) (*CriterionResponse, error) {
	item, err := buildCriterionFromRequest(request)
	if err != nil {
		return nil, err
	}

	exists, err := s.repository.CodeExists(ctx, item.Code, id)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, ErrCriterionCodeAlreadyExists
	}

	item.ID = id

	if err := s.repository.Update(ctx, item); err != nil {
		return nil, err
	}

	if err := s.repository.NormalizeWeights(ctx); err != nil {
		return nil, err
	}

	updatedCriterion, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := updatedCriterion.ToResponse()

	return &response, nil
}

// Delete menghapus kriteria lalu menghitung ulang normalisasi bobot.
func (s *Service) Delete(ctx context.Context, id int64) error {
	if err := s.repository.Delete(ctx, id); err != nil {
		return err
	}

	return s.repository.NormalizeWeights(ctx)
}

// buildCriterionFromRequest membentuk model Criterion dari payload yang sudah divalidasi.
func buildCriterionFromRequest(request SaveCriterionRequest) (*Criterion, error) {
	code := strings.ToUpper(strings.TrimSpace(request.Code))
	name := strings.TrimSpace(request.Name)
	attribute := strings.ToLower(strings.TrimSpace(request.Attribute))

	if code == "" || name == "" || request.Weight <= 0 || !isValidAttribute(attribute) {
		return nil, ErrInvalidCriterionPayload
	}

	return &Criterion{
		Code:      code,
		Name:      name,
		Attribute: attribute,
		Weight:    request.Weight,
	}, nil
}

// isValidAttribute memastikan atribut kriteria hanya benefit atau cost.
func isValidAttribute(attribute string) bool {
	return attribute == AttributeBenefit || attribute == AttributeCost
}
