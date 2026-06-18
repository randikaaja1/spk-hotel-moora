# SPK Hotel Kintamani MOORA - Backend

Backend REST API untuk Sistem Pendukung Keputusan pemilihan hotel di Kintamani menggunakan metode MOORA. Aplikasi ini menangani autentikasi, data master hotel dan kriteria, preferensi pengguna, perhitungan ranking MOORA, dashboard admin, serta pengelolaan pengguna.

## Cara Menjalankan Aplikasi

### Kebutuhan

- Go
- Docker Desktop
- MySQL 8 melalui `docker-compose`

### Setup Environment

Salin file environment contoh:

```powershell
Copy-Item .\.env.example .\.env
```

Isi `.env` sesuai kebutuhan lokal. Default database dari `docker-compose.yml`:

```env
APP_ENV=development
APP_PORT=8080

DB_HOST=localhost
DB_PORT=3307
DB_USER=moora_user
DB_PASSWORD=moora_password
DB_NAME=spk_hotel_moora_db
DB_PARSE_TIME=true
DB_LOC=Local

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

JWT_SECRET=change-this-secret-key
JWT_EXPIRES_IN_HOURS=24
```

### Jalankan Database

```powershell
docker compose up -d
```

### Jalankan Semua Migration

```powershell
Get-ChildItem .\migrations\*.sql | Sort-Object Name | ForEach-Object {
  Get-Content $_.FullName | docker exec -i spk-hotel-moora-mysql mysql -umoora_user -pmoora_password spk_hotel_moora_db
}
```

### Jalankan Backend

```powershell
go run .\cmd\api\main.go
```

Backend berjalan pada:

```text
http://localhost:8080
```

Cek kesehatan API:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

### Build/Test

```powershell
go test ./...
```

Jika Windows menolak akses compiler Go di `C:\Program Files\Go`, jalankan terminal sebagai administrator atau ulangi setelah proses Go lain berhenti.

## Struktur File

```text
cmd/api/main.go
  Entry point aplikasi, membaca config, membuka koneksi database, dan menjalankan HTTP server.

internal/config
  Membaca `.env`, konfigurasi database, CORS, JWT, dan port aplikasi.

internal/database
  Membuat koneksi MySQL dari konfigurasi.

internal/middleware
  Middleware request id, CORS, autentikasi JWT, dan pengecekan role.

internal/modules/auth
  Register, login, profil user login, validasi password, dan JWT.

internal/modules/hotels
  CRUD hotel dan nilai kriteria hotel.

internal/modules/criteria
  CRUD kriteria MOORA, atribut benefit/cost, bobot, dan normalisasi bobot.

internal/modules/preferences
  Preferensi pengguna untuk filter awal rekomendasi.

internal/modules/recommendations
  Perhitungan MOORA, penyimpanan hasil ranking, dan hasil terbaru.

internal/modules/dashboard
  Ringkasan data admin untuk dashboard.

internal/modules/users
  Pengelolaan pengguna oleh admin, termasuk perubahan role dan status aktif.

internal/response
  Format response standar API.

internal/security
  Generate dan validasi JWT.

internal/server
  Registrasi router, middleware global, dan seluruh module handler.

migrations
  File SQL untuk membuat tabel dan seed data awal.
```

## Penjelasan Module

### Auth

Module `auth` menangani:

- Registrasi akun baru dengan role default `user`.
- Login dengan email dan password.
- Penolakan login untuk akun nonaktif.
- Pembuatan JWT berisi `user_id`, `email`, dan `role`.
- Endpoint profil user login melalui token.

### Hotels

Module `hotels` menangani data alternatif dalam metode MOORA.

- Admin dapat menambah, mengubah, dan menghapus hotel.
- Admin dan user login dapat melihat daftar/detail hotel.
- Nilai hotel disimpan secara dinamis pada `hotel_criterion_values`.
- Field lama seperti `price`, `rating_facility`, `accessibility`, `distance_km`, `location_score`, dan `view_score` masih dipakai sebagai fallback kompatibilitas.

### Criteria

Module `criteria` menangani kriteria perhitungan MOORA.

- Kriteria dapat bertipe `benefit` atau `cost`.
- Bobot asli disimpan pada field `weight`.
- Bobot normalisasi dihitung dari total bobot.
- Kriteria dibuat dinamis sehingga penambahan/penghapusan kriteria dapat ikut terbaca oleh perhitungan MOORA.

### Preferences

Module `preferences` menyimpan filter awal untuk user.

Filter yang tersedia:

- `max_budget`
- `min_rating`
- `min_accessibility`
- `max_distance`
- `min_view`

Filter ini menyaring hotel sebelum MOORA dihitung. Filter tidak mengubah rumus MOORA, hanya mengurangi alternatif yang dihitung.

### Recommendations

Module `recommendations` menjalankan MOORA.

- Admin dapat menghitung ranking semua hotel tanpa preferensi user.
- User dapat menghitung ranking berdasarkan preferensi tersimpan atau preferensi yang dikirim saat request.
- Hasil dapat disimpan ke `recommendation_results`.
- Endpoint latest mengambil hasil batch terakhir berdasarkan user dan tipe perhitungan.

### Dashboard

Module `dashboard` menyajikan ringkasan admin, seperti:

- Total hotel.
- Total kriteria.
- Total pengguna.
- Rekomendasi terbaik.
- Distribusi nilai MOORA.
- Status kelengkapan data.

### Users

Module `users` digunakan admin untuk:

- Melihat daftar pengguna.
- Mengubah role pengguna lain.
- Mengaktifkan atau menonaktifkan akun pengguna lain.
- Mencegah admin mengubah role/status akun yang sedang dipakai sendiri.

## Endpoint

Base URL:

```text
http://localhost:8080/api/v1
```

Semua endpoint protected memakai header:

```http
Authorization: Bearer <token>
```

### Health

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| GET | `/health` | Public | Cek status API dan database |

### Auth

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Membuat akun user baru |
| POST | `/auth/login` | Public | Login dan mengambil JWT |
| GET | `/auth/me` | Login | Mengambil profil user login |

### Hotels

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| GET | `/hotels` | Admin/User | Daftar hotel |
| GET | `/hotels/:id` | Admin/User | Detail hotel |
| POST | `/hotels` | Admin | Tambah hotel |
| PUT | `/hotels/:id` | Admin | Ubah hotel |
| DELETE | `/hotels/:id` | Admin | Hapus hotel |

### Criteria

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| GET | `/criteria` | Admin/User | Daftar kriteria |
| GET | `/criteria/:id` | Admin/User | Detail kriteria |
| POST | `/criteria` | Admin | Tambah kriteria |
| PUT | `/criteria/:id` | Admin | Ubah kriteria |
| DELETE | `/criteria/:id` | Admin | Hapus kriteria |

### Preferences

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| POST | `/preferences` | User | Simpan preferensi user |
| GET | `/preferences/latest` | User | Ambil preferensi terakhir user |

### Recommendations

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| POST | `/recommendations/calculate` | Admin/User | Hitung ranking MOORA |
| GET | `/recommendations/latest` | Admin/User | Ambil hasil ranking terakhir |

Contoh request calculate:

```json
{
  "save_result": true,
  "preference": {
    "max_budget": 800000,
    "min_rating": 4,
    "min_accessibility": 3,
    "max_distance": 10,
    "min_view": 4
  }
}
```

Untuk admin, `preference` dapat dikosongkan.

### Dashboard

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| GET | `/dashboard/summary` | Admin | Ringkasan dashboard admin |

### Users

| Method | Endpoint | Role | Fungsi |
| --- | --- | --- | --- |
| GET | `/users` | Admin | Daftar pengguna |
| PATCH | `/users/:id/role` | Admin | Ubah role pengguna |
| PATCH | `/users/:id/status` | Admin | Ubah status aktif pengguna |

## Rumus Perhitungan MOORA

MOORA digunakan untuk memberi nilai preferensi setiap hotel berdasarkan kriteria `benefit` dan `cost`.

### 1. Ambil Alternatif

Alternatif adalah daftar hotel.

```text
A_i = hotel ke-i
```

Contoh:

```text
A1 = Hotel Lakeview
A2 = Kintamani Resort
A3 = D'Kintamani Lodge
```

### 2. Ambil Kriteria

Kriteria berasal dari tabel `criteria`.

```text
C_j = kriteria ke-j
w_j = bobot kriteria ke-j
```

Setiap kriteria punya atribut:

- `benefit`: semakin besar semakin baik.
- `cost`: semakin kecil semakin baik.

Contoh:

```text
C1 = Harga, cost
C2 = Fasilitas, benefit
C3 = Aksesibilitas, benefit
C4 = Lokasi, benefit
C5 = View, benefit
```

### 3. Normalisasi Bobot

Backend menghitung bobot normalisasi saat runtime.

```text
W_j = w_j / total_w
```

dengan:

```text
total_w = w_1 + w_2 + ... + w_n
```

Contoh jika bobot:

```text
C1 = 30
C2 = 25
C3 = 20
C4 = 15
C5 = 10
total_w = 100
```

maka:

```text
W1 = 30 / 100 = 0.30
W2 = 25 / 100 = 0.25
W3 = 20 / 100 = 0.20
W4 = 15 / 100 = 0.15
W5 = 10 / 100 = 0.10
```

### 4. Bentuk Matriks Keputusan

Nilai hotel untuk setiap kriteria menjadi matriks keputusan.

```text
x_ij = nilai hotel i pada kriteria j
```

Contoh:

```text
             Harga      Fasilitas   Akses   Lokasi   View
Hotel A      500000     4           4       5        4
Hotel B      700000     5           3       4        5
Hotel C      600000     3           5       4        4
```

### 5. Normalisasi Matriks

Setiap nilai kriteria dinormalisasi dengan pembagi akar jumlah kuadrat pada kolom yang sama.

```text
r_ij = x_ij / sqrt(sum(x_ij^2))
```

Untuk setiap kriteria:

```text
denominator_j = sqrt(x_1j^2 + x_2j^2 + ... + x_mj^2)
```

Contoh normalisasi harga:

```text
denominator_harga = sqrt(500000^2 + 700000^2 + 600000^2)
                  = sqrt(1,100,000,000,000)
                  = 1,048,808.85

r_A1 = 500000 / 1,048,808.85 = 0.4767
r_B1 = 700000 / 1,048,808.85 = 0.6674
r_C1 = 600000 / 1,048,808.85 = 0.5721
```

### 6. Pembobotan Nilai Normalisasi

Nilai normalisasi dikalikan bobot normalisasi kriteria.

```text
v_ij = r_ij * W_j
```

Contoh harga untuk Hotel A:

```text
v_A1 = 0.4767 * 0.30 = 0.1430
```

### 7. Hitung Nilai Preferensi Yi

Nilai akhir hotel adalah total benefit dikurangi total cost.

```text
Y_i = sum(v_ij benefit) - sum(v_ij cost)
```

Jika `Harga` adalah cost, sedangkan `Fasilitas`, `Akses`, `Lokasi`, dan `View` adalah benefit:

```text
Y_i = (v_fasilitas + v_akses + v_lokasi + v_view) - v_harga
```

### 8. Ranking

Hotel diurutkan berdasarkan `Y_i` terbesar ke terkecil.

```text
Y terbesar = ranking 1
Y terkecil = ranking terakhir
```

Jika dua hotel punya nilai sama, backend mengurutkan berdasarkan nama hotel secara alfabetis.

## Fitur

- Autentikasi JWT.
- Role `admin` dan `user`.
- Register user dengan role default `user`.
- Login ditolak jika akun dinonaktifkan.
- CRUD hotel oleh admin.
- CRUD kriteria MOORA oleh admin.
- Nilai kriteria hotel bersifat dinamis.
- Preferensi user untuk menyaring alternatif.
- Perhitungan MOORA untuk admin dan user.
- Penyimpanan hasil ranking terakhir.
- Dashboard ringkasan admin.
- Manajemen pengguna oleh admin: ubah role dan status aktif.
- Response API standar dengan metadata request ID dan timestamp.
