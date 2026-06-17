CREATE TABLE IF NOT EXISTS hotel_criterion_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    criterion_id BIGINT NOT NULL,
    value DECIMAL(14, 4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hotel_criterion_values_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_hotel_criterion_values_criterion FOREIGN KEY (criterion_id) REFERENCES criteria(id) ON DELETE CASCADE,
    CONSTRAINT uq_hotel_criterion_values_hotel_criterion UNIQUE (hotel_id, criterion_id)
);

CREATE INDEX idx_hotel_criterion_values_hotel ON hotel_criterion_values(hotel_id);
CREATE INDEX idx_hotel_criterion_values_criterion ON hotel_criterion_values(criterion_id);

INSERT INTO hotel_criterion_values (hotel_id, criterion_id, value)
SELECT
    h.id,
    c.id,
    CASE
        WHEN UPPER(c.code) = 'C1' OR LOWER(c.name) LIKE '%biaya%' OR LOWER(c.name) LIKE '%harga%' THEN h.price
        WHEN UPPER(c.code) = 'C2' OR LOWER(c.name) LIKE '%fasilitas%' OR LOWER(c.name) LIKE '%rating%' THEN h.rating_facility
        WHEN UPPER(c.code) = 'C3' OR LOWER(c.name) LIKE '%akses%' THEN h.accessibility
        WHEN UPPER(c.code) = 'C4' OR LOWER(c.name) LIKE '%lokasi%' THEN h.location_score
        WHEN UPPER(c.code) = 'C5' OR LOWER(c.name) LIKE '%view%' THEN h.view_score
        WHEN LOWER(c.name) LIKE '%jarak%' THEN h.distance_km
        ELSE 0
    END AS value
FROM hotels h
CROSS JOIN criteria c
WHERE 1 = 1
ON DUPLICATE KEY UPDATE
    value = VALUES(value);
