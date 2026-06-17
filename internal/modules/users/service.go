package users

import (
	"context"
	"strings"

	"spk-hotel-moora-service-go/internal/modules/auth"
)

type Service struct {
	repository *Repository
}

// NewService membuat service pengguna untuk pengaturan role dan status akun.
func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

// List mengambil semua pengguna untuk halaman admin.
func (s *Service) List(ctx context.Context) ([]UserResponse, error) {
	items, err := s.repository.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	return ToResponses(items), nil
}

// UpdateRole memvalidasi dan mengubah role pengguna.
func (s *Service) UpdateRole(ctx context.Context, currentUserID int64, targetUserID int64, request UpdateRoleRequest) (*UserResponse, error) {
	role := strings.ToLower(strings.TrimSpace(request.Role))
	if targetUserID <= 0 || !isValidRole(role) {
		return nil, ErrInvalidUserPayload
	}

	if currentUserID == targetUserID {
		return nil, ErrSelfActionBlocked
	}

	if err := s.repository.UpdateRole(ctx, targetUserID, role); err != nil {
		return nil, err
	}

	updatedUser, err := s.repository.FindByID(ctx, targetUserID)
	if err != nil {
		return nil, err
	}

	response := updatedUser.ToResponse()

	return &response, nil
}

// UpdateStatus memvalidasi dan mengubah status aktif pengguna.
func (s *Service) UpdateStatus(ctx context.Context, currentUserID int64, targetUserID int64, request UpdateStatusRequest) (*UserResponse, error) {
	if targetUserID <= 0 {
		return nil, ErrInvalidUserPayload
	}

	if currentUserID == targetUserID {
		return nil, ErrSelfActionBlocked
	}

	if err := s.repository.UpdateStatus(ctx, targetUserID, request.IsActive); err != nil {
		return nil, err
	}

	updatedUser, err := s.repository.FindByID(ctx, targetUserID)
	if err != nil {
		return nil, err
	}

	response := updatedUser.ToResponse()

	return &response, nil
}

// isValidRole memastikan role hanya admin atau user.
func isValidRole(role string) bool {
	return role == auth.RoleAdmin || role == auth.RoleUser
}
