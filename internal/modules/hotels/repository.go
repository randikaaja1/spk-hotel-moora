package hotels

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
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
			location_score, view_score, COALESCE(description, ''), created_at, updated_at
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

	return hotels, nil
}

// FindByID mencari satu hotel berdasarkan id.
func (r *Repository) FindByID(ctx context.Context, id int64) (*Hotel, error) {
	query := `
		SELECT id, name, price, rating_facility, accessibility, distance_km,
			location_score, view_score, COALESCE(description, ''), created_at, updated_at
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

	return hotel, nil
}

// Create menyimpan hotel baru ke database.
func (r *Repository) Create(ctx context.Context, hotel *Hotel) error {
	query := `
		INSERT INTO hotels (
			name, price, rating_facility, accessibility, distance_km,
			location_score, view_score, description
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		hotel.Name,
		hotel.Price,
		hotel.RatingFacility,
		hotel.Accessibility,
		hotel.DistanceKM,
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

	return nil
}

// Update memperbarui seluruh field hotel berdasarkan id.
func (r *Repository) Update(ctx context.Context, hotel *Hotel) error {
	query := `
		UPDATE hotels
		SET name = ?, price = ?, rating_facility = ?, accessibility = ?,
			distance_km = ?, location_score = ?, view_score = ?, description = ?
		WHERE id = ?
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		hotel.Name,
		hotel.Price,
		hotel.RatingFacility,
		hotel.Accessibility,
		hotel.DistanceKM,
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
