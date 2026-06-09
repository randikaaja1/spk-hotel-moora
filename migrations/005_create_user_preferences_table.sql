CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    max_budget DECIMAL(12, 2) NULL,
    min_rating DECIMAL(4, 2) NULL,
    min_accessibility DECIMAL(4, 2) NULL,
    max_distance DECIMAL(8, 2) NULL,
    min_view DECIMAL(4, 2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_preferences_user UNIQUE (user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
