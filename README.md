# SPK Hotel Kintamani MOORA - Backend

Backend untuk Sistem Pendukung Keputusan Pemilihan Hotel di Kintamani menggunakan metode MOORA.

## Tech Stack

- Go
- Gin
- MySQL
- Docker Compose
- JWT untuk tahap auth berikutnya

## Struktur Folder

```text
cmd/api/main.go
internal/config
internal/database
internal/middleware
internal/modules
internal/response
internal/server
migrations
```

## Endpoint MVP

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/hotels`
- `POST /api/v1/hotels` admin
- `GET /api/v1/hotels/:id`
- `PUT /api/v1/hotels/:id` admin
- `DELETE /api/v1/hotels/:id` admin
- `GET /api/v1/criteria`
- `POST /api/v1/criteria` admin
- `GET /api/v1/criteria/:id`
- `PUT /api/v1/criteria/:id` admin
- `DELETE /api/v1/criteria/:id` admin
- `POST /api/v1/preferences` user
- `GET /api/v1/preferences/latest` user
- `POST /api/v1/recommendations/calculate`
- `GET /api/v1/recommendations/latest`
- `GET /api/v1/dashboard/summary` admin
