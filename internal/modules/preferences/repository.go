package preferences

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

type Repository struct {
	db *sql.DB
}

type scanner interface {
	Scan(dest ...any) error
}

// NewRepository membuat repository preferensi untuk akses tabel user_preferences.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// Upsert menyimpan preferensi baru atau memperbarui preferensi terakhir user.
func (r *Repository) Upsert(ctx context.Context, preference *Preference) error {
	query := `
		INSERT INTO user_preferences (
			user_id, max_budget, min_rating, min_accessibility, max_distance, min_view
		)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			max_budget = VALUES(max_budget),
			min_rating = VALUES(min_rating),
			min_accessibility = VALUES(min_accessibility),
			max_distance = VALUES(max_distance),
			min_view = VALUES(min_view)
	`

	if _, err := r.db.ExecContext(
		ctx,
		query,
		preference.UserID,
		nullableFloat(preference.MaxBudget),
		nullableFloat(preference.MinRating),
		nullableFloat(preference.MinAccessibility),
		nullableFloat(preference.MaxDistance),
		nullableFloat(preference.MinView),
	); err != nil {
		return fmt.Errorf("upsert user preference: %w", err)
	}

	return nil
}

// FindByUserID mengambil preferensi terakhir berdasarkan user id.
func (r *Repository) FindByUserID(ctx context.Context, userID int64) (*Preference, error) {
	query := `
		SELECT id, user_id, max_budget, min_rating, min_accessibility, max_distance,
			min_view, created_at, updated_at
		FROM user_preferences
		WHERE user_id = ?
		LIMIT 1
	`

	preference := new(Preference)
	if err := scanPreference(r.db.QueryRowContext(ctx, query, userID), preference); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrPreferenceNotFound
		}

		return nil, err
	}

	return preference, nil
}

// nullableFloat mengubah pointer float menjadi nilai SQL yang mendukung NULL.
func nullableFloat(value *float64) any {
	if value == nil {
		return nil
	}

	return *value
}

// floatPtrFromNull mengubah sql.NullFloat64 menjadi pointer float untuk response.
func floatPtrFromNull(value sql.NullFloat64) *float64 {
	if !value.Valid {
		return nil
	}

	return &value.Float64
}

// scanPreference membaca satu baris query preferensi ke struct Preference.
func scanPreference(source scanner, preference *Preference) error {
	var maxBudget sql.NullFloat64
	var minRating sql.NullFloat64
	var minAccessibility sql.NullFloat64
	var maxDistance sql.NullFloat64
	var minView sql.NullFloat64

	if err := source.Scan(
		&preference.ID,
		&preference.UserID,
		&maxBudget,
		&minRating,
		&minAccessibility,
		&maxDistance,
		&minView,
		&preference.CreatedAt,
		&preference.UpdatedAt,
	); err != nil {
		return fmt.Errorf("scan preference: %w", err)
	}

	preference.MaxBudget = floatPtrFromNull(maxBudget)
	preference.MinRating = floatPtrFromNull(minRating)
	preference.MinAccessibility = floatPtrFromNull(minAccessibility)
	preference.MaxDistance = floatPtrFromNull(maxDistance)
	preference.MinView = floatPtrFromNull(minView)

	return nil
}
