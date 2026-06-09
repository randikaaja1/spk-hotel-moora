package dashboard

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository struct {
	db *sql.DB
}

// NewRepository membuat repository dashboard untuk query ringkasan lintas modul.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// CountUsers menghitung total user terdaftar untuk dashboard admin.
func (r *Repository) CountUsers(ctx context.Context) (int64, error) {
	query := `SELECT COUNT(*) FROM users`

	var total int64
	if err := r.db.QueryRowContext(ctx, query).Scan(&total); err != nil {
		return 0, fmt.Errorf("count users: %w", err)
	}

	return total, nil
}
