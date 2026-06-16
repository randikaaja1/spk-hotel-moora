CREATE TABLE IF NOT EXISTS recommendation_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    hotel_id BIGINT NOT NULL,
    preference_value DECIMAL(12, 8) NOT NULL,
    `rank` INT NOT NULL,
    calculation_type ENUM('admin', 'user') NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_recommendation_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_recommendation_results_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

CREATE INDEX idx_recommendation_results_user_type_created ON recommendation_results(user_id, calculation_type, created_at);
CREATE INDEX idx_recommendation_results_rank ON recommendation_results(`rank`);
