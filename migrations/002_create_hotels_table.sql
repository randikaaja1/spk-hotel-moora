CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    rating_facility DECIMAL(4, 2) NOT NULL,
    accessibility DECIMAL(4, 2) NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL,
    google_maps_url VARCHAR(500) NULL,
    location_score DECIMAL(4, 2) NOT NULL,
    view_score DECIMAL(4, 2) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_price ON hotels(price);
CREATE INDEX idx_hotels_rating_facility ON hotels(rating_facility);
CREATE INDEX idx_hotels_distance_km ON hotels(distance_km);
