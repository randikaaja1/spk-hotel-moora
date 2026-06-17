package recommendations

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

type Repository struct {
	db *sql.DB
}

// NewRepository membuat repository rekomendasi untuk akses tabel recommendation_results.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// SaveResults menyimpan satu batch hasil ranking rekomendasi.
func (r *Repository) SaveResults(ctx context.Context, userID int64, calculationType string, results []RecommendationItemResponse) error {
	if len(results) == 0 {
		return nil
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin save recommendation results transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO recommendation_results (
			user_id, hotel_id, preference_value, ` + "`rank`" + `, calculation_type, created_at
		)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	createdAt := time.Now()
	for _, result := range results {
		if _, err := tx.ExecContext(
			ctx,
			query,
			userID,
			result.Hotel.ID,
			result.PreferenceValue,
			result.Rank,
			calculationType,
			createdAt,
		); err != nil {
			return fmt.Errorf("insert recommendation result: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit recommendation results: %w", err)
	}

	return nil
}

// FindLatest mengambil batch rekomendasi terakhir berdasarkan user dan tipe perhitungan.
func (r *Repository) FindLatest(ctx context.Context, userID int64, calculationType string) ([]StoredResult, error) {
	query := `
		SELECT
			r.calculation_type,
			r.created_at,
			r.` + "`rank`" + `,
			r.preference_value,
			h.id,
			h.name,
			h.price,
			h.rating_facility,
			h.accessibility,
			h.distance_km,
			h.location_score,
			h.view_score,
			COALESCE(h.description, ''),
			h.created_at,
			h.updated_at
		FROM recommendation_results r
		INNER JOIN hotels h ON h.id = r.hotel_id
		WHERE r.user_id = ?
			AND r.calculation_type = ?
			AND r.created_at = (
				SELECT MAX(created_at)
				FROM recommendation_results
				WHERE user_id = ? AND calculation_type = ?
			)
		ORDER BY r.` + "`rank`" + ` ASC
	`

	rows, err := r.db.QueryContext(ctx, query, userID, calculationType, userID, calculationType)
	if err != nil {
		return nil, fmt.Errorf("find latest recommendation results: %w", err)
	}
	defer rows.Close()

	results := make([]StoredResult, 0)
	for rows.Next() {
		var result StoredResult
		if err := rows.Scan(
			&result.CalculationType,
			&result.CreatedAt,
			&result.Rank,
			&result.PreferenceValue,
			&result.Hotel.ID,
			&result.Hotel.Name,
			&result.Hotel.Price,
			&result.Hotel.RatingFacility,
			&result.Hotel.Accessibility,
			&result.Hotel.DistanceKM,
			&result.Hotel.LocationScore,
			&result.Hotel.ViewScore,
			&result.Hotel.Description,
			&result.Hotel.CreatedAt,
			&result.Hotel.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan latest recommendation result: %w", err)
		}

		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate latest recommendation results: %w", err)
	}

	if len(results) == 0 {
		return nil, ErrRecommendationNotFound
	}

	return results, nil
}

// FindTopResult mengambil rekomendasi dengan nilai tertinggi untuk dashboard admin.
func (r *Repository) FindTopResult(ctx context.Context) (*StoredResult, error) {
	query := `
		SELECT
			r.calculation_type,
			r.created_at,
			r.` + "`rank`" + `,
			r.preference_value,
			h.id,
			h.name,
			h.price,
			h.rating_facility,
			h.accessibility,
			h.distance_km,
			h.location_score,
			h.view_score,
			COALESCE(h.description, ''),
			h.created_at,
			h.updated_at
		FROM recommendation_results r
		INNER JOIN hotels h ON h.id = r.hotel_id
		ORDER BY r.preference_value DESC, r.created_at DESC
		LIMIT 1
	`

	result := new(StoredResult)
	err := r.db.QueryRowContext(ctx, query).Scan(
		&result.CalculationType,
		&result.CreatedAt,
		&result.Rank,
		&result.PreferenceValue,
		&result.Hotel.ID,
		&result.Hotel.Name,
		&result.Hotel.Price,
		&result.Hotel.RatingFacility,
		&result.Hotel.Accessibility,
		&result.Hotel.DistanceKM,
		&result.Hotel.LocationScore,
		&result.Hotel.ViewScore,
		&result.Hotel.Description,
		&result.Hotel.CreatedAt,
		&result.Hotel.UpdatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrRecommendationNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("find top recommendation result: %w", err)
	}

	return result, nil
}
