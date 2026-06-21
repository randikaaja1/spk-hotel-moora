SET @column_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'hotels'
        AND COLUMN_NAME = 'google_maps_url'
);

SET @add_column_sql := IF(
    @column_exists = 0,
    'ALTER TABLE hotels ADD COLUMN google_maps_url VARCHAR(500) NULL AFTER distance_km',
    'SELECT 1'
);

PREPARE add_column_stmt FROM @add_column_sql;
EXECUTE add_column_stmt;
DEALLOCATE PREPARE add_column_stmt;
