package auth

import (
	"context"
	"net/mail"
	"strings"

	"spk-hotel-moora-service-go/internal/config"
	"spk-hotel-moora-service-go/internal/security"

	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repository *Repository
	cfg        *config.Config
}

// NewService membuat service auth untuk register, login, dan profil user login.
func NewService(repository *Repository, cfg *config.Config) *Service {
	return &Service{
		repository: repository,
		cfg:        cfg,
	}
}

// Register membuat akun user baru dengan role default user.
func (s *Service) Register(ctx context.Context, request RegisterRequest) (*UserResponse, error) {
	name := strings.TrimSpace(request.Name)
	email := normalizeEmail(request.Email)
	password := strings.TrimSpace(request.Password)

	if name == "" || email == "" || password == "" || len(password) < 6 || !isValidEmail(email) {
		return nil, ErrInvalidRegisterPayload
	}

	exists, err := s.repository.EmailExists(ctx, email)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, ErrEmailAlreadyRegistered
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &User{
		Name:         name,
		Email:        email,
		PasswordHash: string(passwordHash),
		Role:         RoleUser,
	}

	if err := s.repository.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	createdUser, err := s.repository.FindByID(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	response := createdUser.ToResponse()

	return &response, nil
}

// Login memvalidasi email dan password lalu menghasilkan JWT.
func (s *Service) Login(ctx context.Context, request LoginRequest) (*LoginResponse, error) {
	email := normalizeEmail(request.Email)
	password := strings.TrimSpace(request.Password)

	if email == "" || password == "" || !isValidEmail(email) {
		return nil, ErrInvalidLoginPayload
	}

	user, err := s.repository.FindByEmail(ctx, email)
	if err != nil {
		if err == ErrUserNotFound {
			return nil, ErrInvalidCredentials
		}

		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := security.GenerateToken(user.ID, user.Email, user.Role, s.cfg)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		User:  user.ToResponse(),
	}, nil
}

// GetMe mengambil data profil user yang sedang login.
func (s *Service) GetMe(ctx context.Context, userID int64) (*UserResponse, error) {
	user, err := s.repository.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	response := user.ToResponse()

	return &response, nil
}

// normalizeEmail merapikan format email sebelum disimpan atau digunakan login.
func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// isValidEmail memvalidasi format email secara sederhana.
func isValidEmail(email string) bool {
	address, err := mail.ParseAddress(email)
	if err != nil {
		return false
	}

	return address.Address == email
}
