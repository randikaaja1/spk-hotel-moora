UPDATE criteria
SET name = 'Jarak',
    attribute = 'cost'
WHERE UPPER(code) = 'C4';

UPDATE hotel_criterion_values hcv
INNER JOIN criteria c ON c.id = hcv.criterion_id
INNER JOIN hotels h ON h.id = hcv.hotel_id
SET hcv.value = h.distance_km
WHERE UPPER(c.code) = 'C4'
   OR LOWER(c.name) LIKE '%jarak%';
