package criteria

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

// NewRepository membuat repository kriteria untuk akses tabel criteria.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// FindAll mengambil seluruh kriteria yang digunakan dalam perhitungan MOORA.
func (r *Repository) FindAll(ctx context.Context) ([]Criterion, error) {
	query := `
		SELECT id, code, name, attribute, weight, normalized_weight, created_at, updated_at
		FROM criteria
		ORDER BY code ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("find all criteria: %w", err)
	}
	defer rows.Close()

	items := make([]Criterion, 0)
	for rows.Next() {
		var item Criterion
		if err := scanCriterion(rows, &item); err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate criteria: %w", err)
	}

	return items, nil
}

// FindByID mencari satu kriteria berdasarkan id.
func (r *Repository) FindByID(ctx context.Context, id int64) (*Criterion, error) {
	query := `
		SELECT id, code, name, attribute, weight, normalized_weight, created_at, updated_at
		FROM criteria
		WHERE id = ?
		LIMIT 1
	`

	item := new(Criterion)
	if err := scanCriterion(r.db.QueryRowContext(ctx, query, id), item); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrCriterionNotFound
		}

		return nil, err
	}

	return item, nil
}

// Create menyimpan kriteria baru ke database.
func (r *Repository) Create(ctx context.Context, item *Criterion) error {
	query := `
		INSERT INTO criteria (code, name, attribute, weight, normalized_weight)
		VALUES (?, ?, ?, ?, ?)
	`

	result, err := r.db.ExecContext(ctx, query, item.Code, item.Name, item.Attribute, item.Weight, item.NormalizedWeight)
	if err != nil {
		return fmt.Errorf("create criterion: %w", err)
	}

	criterionID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("get criterion last insert id: %w", err)
	}

	item.ID = criterionID

	return nil
}

// Update memperbarui kriteria berdasarkan id.
func (r *Repository) Update(ctx context.Context, item *Criterion) error {
	query := `
		UPDATE criteria
		SET code = ?, name = ?, attribute = ?, weight = ?
		WHERE id = ?
	`

	result, err := r.db.ExecContext(ctx, query, item.Code, item.Name, item.Attribute, item.Weight, item.ID)
	if err != nil {
		return fmt.Errorf("update criterion: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("get criterion updated rows: %w", err)
	}

	if rowsAffected == 0 {
		return ErrCriterionNotFound
	}

	return nil
}

// Delete menghapus kriteria berdasarkan id.
func (r *Repository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM criteria WHERE id = ?`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete criterion: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("get criterion deleted rows: %w", err)
	}

	if rowsAffected == 0 {
		return ErrCriterionNotFound
	}

	return nil
}

// CodeExists memeriksa apakah kode kriteria sudah dipakai oleh data lain.
func (r *Repository) CodeExists(ctx context.Context, code string, excludedID int64) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM criteria
			WHERE code = ? AND (? = 0 OR id <> ?)
		)
	`

	var exists bool
	if err := r.db.QueryRowContext(ctx, query, code, excludedID, excludedID).Scan(&exists); err != nil {
		return false, fmt.Errorf("check criterion code exists: %w", err)
	}

	return exists, nil
}

// NormalizeWeights memperbarui bobot ternormalisasi untuk seluruh kriteria.
func (r *Repository) NormalizeWeights(ctx context.Context) error {
	var totalWeight float64
	if err := r.db.QueryRowContext(ctx, `SELECT COALESCE(SUM(weight), 0) FROM criteria`).Scan(&totalWeight); err != nil {
		return fmt.Errorf("sum criteria weight: %w", err)
	}

	if totalWeight <= 0 {
		if _, err := r.db.ExecContext(ctx, `UPDATE criteria SET normalized_weight = 0`); err != nil {
			return fmt.Errorf("reset normalized criteria weight: %w", err)
		}

		return nil
	}

	if _, err := r.db.ExecContext(ctx, `UPDATE criteria SET normalized_weight = weight / ?`, totalWeight); err != nil {
		return fmt.Errorf("normalize criteria weight: %w", err)
	}

	return nil
}

// EnsureHotelValues membuat nilai awal kriteria untuk seluruh hotel yang sudah ada.
func (r *Repository) EnsureHotelValues(ctx context.Context, criterionID int64, defaultValue float64) error {
	query := `
		INSERT INTO hotel_criterion_values (hotel_id, criterion_id, value)
		SELECT id, ?, ?
		FROM hotels
		ON DUPLICATE KEY UPDATE
			value = hotel_criterion_values.value
	`

	if _, err := r.db.ExecContext(ctx, query, criterionID, defaultValue); err != nil {
		return fmt.Errorf("ensure hotel criterion values: %w", err)
	}

	return nil
}

// Count menghitung total kriteria untuk kebutuhan dashboard admin.
func (r *Repository) Count(ctx context.Context) (int64, error) {
	query := `SELECT COUNT(*) FROM criteria`

	var total int64
	if err := r.db.QueryRowContext(ctx, query).Scan(&total); err != nil {
		return 0, fmt.Errorf("count criteria: %w", err)
	}

	return total, nil
}

// scanCriterion membaca satu baris query kriteria ke struct Criterion.
func scanCriterion(source scanner, item *Criterion) error {
	if err := source.Scan(
		&item.ID,
		&item.Code,
		&item.Name,
		&item.Attribute,
		&item.Weight,
		&item.NormalizedWeight,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return fmt.Errorf("scan criterion: %w", err)
	}

	return nil
}
