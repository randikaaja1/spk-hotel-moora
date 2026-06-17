package users

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

type Repository struct {
	db *sql.DB
}

// NewRepository membuat repository pengguna untuk akses tabel users.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// FindAll mengambil seluruh user yang terdaftar untuk halaman admin.
func (r *Repository) FindAll(ctx context.Context) ([]User, error) {
	query := `
		SELECT id, name, email, role, is_active, created_at, updated_at
		FROM users
		ORDER BY created_at DESC, id DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("find all users: %w", err)
	}
	defer rows.Close()

	items := make([]User, 0)
	for rows.Next() {
		var item User
		if err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Email,
			&item.Role,
			&item.IsActive,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate users: %w", err)
	}

	return items, nil
}

// FindByID mencari satu user berdasarkan id.
func (r *Repository) FindByID(ctx context.Context, id int64) (*User, error) {
	query := `
		SELECT id, name, email, role, is_active, created_at, updated_at
		FROM users
		WHERE id = ?
		LIMIT 1
	`

	item := new(User)
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&item.ID,
		&item.Name,
		&item.Email,
		&item.Role,
		&item.IsActive,
		&item.CreatedAt,
		&item.UpdatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrUserNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("find user by id: %w", err)
	}

	return item, nil
}

// UpdateRole mengubah role user berdasarkan id.
func (r *Repository) UpdateRole(ctx context.Context, id int64, role string) error {
	result, err := r.db.ExecContext(ctx, `UPDATE users SET role = ? WHERE id = ?`, role, id)
	if err != nil {
		return fmt.Errorf("update user role: %w", err)
	}

	return ensureAffected(result)
}

// UpdateStatus mengubah status aktif user berdasarkan id.
func (r *Repository) UpdateStatus(ctx context.Context, id int64, isActive bool) error {
	result, err := r.db.ExecContext(ctx, `UPDATE users SET is_active = ? WHERE id = ?`, isActive, id)
	if err != nil {
		return fmt.Errorf("update user status: %w", err)
	}

	return ensureAffected(result)
}

// ensureAffected memastikan operasi update menyentuh minimal satu baris.
func ensureAffected(result sql.Result) error {
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("get user affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}
