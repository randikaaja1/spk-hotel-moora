package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"spk-hotel-moora-service-go/internal/config"

	_ "github.com/go-sql-driver/mysql"
)

// Connect membuat koneksi ke MySQL dan memastikan database dapat diakses.
func Connect(cfg *config.Config) (*sql.DB, error) {
	db, err := sql.Open("mysql", cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("failed to open mysql connection: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("failed to ping mysql database: %w", err)
	}

	return db, nil
}

// Close menutup koneksi database ketika aplikasi dihentikan.
func Close(db *sql.DB) {
	if db != nil {
		_ = db.Close()
	}
}
