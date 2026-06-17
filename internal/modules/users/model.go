package users

import "time"

type User struct {
	ID        int64
	Name      string
	Email     string
	Role      string
	IsActive  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserResponse struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UpdateRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

type UpdateStatusRequest struct {
	IsActive bool `json:"is_active"`
}

// ToResponse mengubah model user menjadi response untuk admin.
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

// ToResponses mengubah daftar user menjadi response untuk halaman admin.
func ToResponses(items []User) []UserResponse {
	responses := make([]UserResponse, 0, len(items))
	for index := range items {
		responses = append(responses, items[index].ToResponse())
	}

	return responses
}
