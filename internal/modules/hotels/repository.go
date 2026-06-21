package hotels

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type Repository struct {
	db *sql.DB
}

// NewRepository membuat repository hotel untuk akses tabel hotels.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// FindAll mengambil seluruh hotel yang tersedia sebagai alternatif MOORA.
func (r *Repository) FindAll(ctx context.Context) ([]Hotel, error) {
	query := `
		SELECT id, name, price, rating_facility, accessibility, distance_km,
			COALESCE(google_maps_url, ''), location_score, view_score, COALESCE(description, ''), created_at, updated_at
		FROM hotels
		ORDER BY id DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("find all hotels: %w", err)
	}
	defer rows.Close()

	hotels := make([]Hotel, 0)
	for rows.Next() {
		var hotel Hotel
		if err := scanHotel(rows, &hotel); err != nil {
			return nil, err
		}

		hotels = append(hotels, hotel)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate hotels: %w", err)
	}

	if err := r.attachCriterionValues(ctx, hotels); err != nil {
		return nil, err
	}

	return hotels, nil
}

// FindByID mencari satu hotel berdasarkan id.
func (r *Repository) FindByID(ctx context.Context, id int64) (*Hotel, error) {
	query := `
		SELECT id, name, price, rating_facility, accessibility, distance_km,
			COALESCE(google_maps_url, ''), location_score, view_score, COALESCE(description, ''), created_at, updated_at
		FROM hotels
		WHERE id = ?
		LIMIT 1
	`

	hotel := new(Hotel)
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&hotel.ID,
		&hotel.Name,
		&hotel.Price,
		&hotel.RatingFacility,
		&hotel.Accessibility,
		&hotel.DistanceKM,
		&hotel.GoogleMapsURL,
		&hotel.LocationScore,
		&hotel.ViewScore,
		&hotel.Description,
		&hotel.CreatedAt,
		&hotel.UpdatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrHotelNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("find hotel by id: %w", err)
	}

	hotels := []Hotel{*hotel}
	if err := r.attachCriterionValues(ctx, hotels); err != nil {
		return nil, err
	}
	*hotel = hotels[0]

	return hotel, nil
}

// Create menyimpan hotel baru ke database.
func (r *Repository) Create(ctx context.Context, hotel *Hotel) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin create hotel transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO hotels (
			name, price, rating_facility, accessibility, distance_km,
			google_maps_url, location_score, view_score, description
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := tx.ExecContext(
		ctx,
		query,
		hotel.Name,
		hotel.Price,
		hotel.RatingFacility,
		hotel.Accessibility,
		hotel.DistanceKM,
		hotel.GoogleMapsURL,
		hotel.LocationScore,
		hotel.ViewScore,
		hotel.Description,
	)
	if err != nil {
		return fmt.Errorf("create hotel: %w", err)
	}

	hotelID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("get hotel last insert id: %w", err)
	}

	hotel.ID = hotelID

	if err := r.saveCriterionValuesTx(ctx, tx, hotel.ID, hotel.CriterionValues); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit create hotel transaction: %w", err)
	}

	return nil
}

// Update memperbarui seluruh field hotel berdasarkan id.
func (r *Repository) Update(ctx context.Context, hotel *Hotel) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin update hotel transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		UPDATE hotels
		SET name = ?, price = ?, rating_facility = ?, accessibility = ?,
			distance_km = ?, google_maps_url = ?, location_score = ?, view_score = ?, description = ?
		WHERE id = ?
	`

	result, err := tx.ExecContext(
		ctx,
		query,
		hotel.Name,
		hotel.Price,
		hotel.RatingFacility,
		hotel.Accessibility,
		hotel.DistanceKM,
		hotel.GoogleMapsURL,
		hotel.LocationScore,
		hotel.ViewScore,
		hotel.Description,
		hotel.ID,
	)
	if err != nil {
		return fmt.Errorf("update hotel: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("get hotel updated rows: %w", err)
	}

	if rowsAffected == 0 {
		return ErrHotelNotFound
	}

	if err := r.saveCriterionValuesTx(ctx, tx, hotel.ID, hotel.CriterionValues); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit update hotel transaction: %w", err)
	}

	return nil
}

// Delete menghapus hotel berdasarkan id.
func (r *Repository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM hotels WHERE id = ?`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete hotel: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("get hotel deleted rows: %w", err)
	}

	if rowsAffected == 0 {
		return ErrHotelNotFound
	}

	return nil
}

// Count menghitung total hotel untuk kebutuhan dashboard admin.
func (r *Repository) Count(ctx context.Context) (int64, error) {
	query := `SELECT COUNT(*) FROM hotels`

	var total int64
	if err := r.db.QueryRowContext(ctx, query).Scan(&total); err != nil {
		return 0, fmt.Errorf("count hotels: %w", err)
	}

	return total, nil
}

// scanHotel membaca satu baris query hotel ke struct Hotel.
func scanHotel(rows *sql.Rows, hotel *Hotel) error {
	if err := rows.Scan(
		&hotel.ID,
		&hotel.Name,
		&hotel.Price,
		&hotel.RatingFacility,
		&hotel.Accessibility,
		&hotel.DistanceKM,
		&hotel.GoogleMapsURL,
		&hotel.LocationScore,
		&hotel.ViewScore,
		&hotel.Description,
		&hotel.CreatedAt,
		&hotel.UpdatedAt,
	); err != nil {
		return fmt.Errorf("scan hotel: %w", err)
	}

	return nil
}

// attachCriterionValues mengambil nilai kriteria dinamis untuk daftar hotel.
func (r *Repository) attachCriterionValues(ctx context.Context, hotels []Hotel) error {
	if len(hotels) == 0 {
		return nil
	}

	hotelIndexByID := make(map[int64]int, len(hotels))
	hotelIDs := make([]any, 0, len(hotels))
	for index, hotel := range hotels {
		hotelIndexByID[hotel.ID] = index
		hotelIDs = append(hotelIDs, hotel.ID)
	}

	query := fmt.Sprintf(`
		SELECT
			hcv.hotel_id,
			c.id,
			c.code,
			c.name,
			c.attribute,
			hcv.value
		FROM hotel_criterion_values hcv
		INNER JOIN criteria c ON c.id = hcv.criterion_id
		WHERE hcv.hotel_id IN (%s)
		ORDER BY c.code ASC
	`, buildPlaceholders(len(hotelIDs)))

	rows, err := r.db.QueryContext(ctx, query, hotelIDs...)
	if err != nil {
		return fmt.Errorf("find hotel criterion values: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var hotelID int64
		var value HotelCriterionValue
		if err := rows.Scan(
			&hotelID,
			&value.CriterionID,
			&value.Code,
			&value.Name,
			&value.Attribute,
			&value.Value,
		); err != nil {
			return fmt.Errorf("scan hotel criterion value: %w", err)
		}

		if index, ok := hotelIndexByID[hotelID]; ok {
			hotels[index].CriterionValues = append(hotels[index].CriterionValues, value)
		}
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("iterate hotel criterion values: %w", err)
	}

	return nil
}

// saveCriterionValuesTx menyimpan nilai kriteria hotel dalam transaksi yang sama.
func (r *Repository) saveCriterionValuesTx(ctx context.Context, tx *sql.Tx, hotelID int64, values []HotelCriterionValue) error {
	if len(values) == 0 {
		return nil
	}

	query := `
		INSERT INTO hotel_criterion_values (hotel_id, criterion_id, value)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE
			value = VALUES(value)
	`

	for _, value := range values {
		if _, err := tx.ExecContext(ctx, query, hotelID, value.CriterionID, value.Value); err != nil {
			return fmt.Errorf("save hotel criterion value: %w", err)
		}
	}

	return nil
}

// buildPlaceholders membuat placeholder SQL untuk query IN berdasarkan jumlah item.
func buildPlaceholders(count int) string {
	if count <= 0 {
		return ""
	}

	return strings.TrimSuffix(strings.Repeat("?,", count), ",")
}
