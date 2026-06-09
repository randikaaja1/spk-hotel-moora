INSERT INTO criteria (code, name, attribute, weight, normalized_weight)
VALUES
    ('C1', 'Biaya', 'cost', 30, 0.300000),
    ('C2', 'Rating Fasilitas', 'benefit', 25, 0.250000),
    ('C3', 'Aksesibilitas', 'benefit', 20, 0.200000),
    ('C4', 'Lokasi', 'benefit', 15, 0.150000),
    ('C5', 'View', 'benefit', 10, 0.100000)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    attribute = VALUES(attribute),
    weight = VALUES(weight),
    normalized_weight = VALUES(normalized_weight);
