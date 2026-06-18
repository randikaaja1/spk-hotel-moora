# SPK Hotel Kintamani MOORA - Frontend

Frontend web untuk Sistem Pendukung Keputusan pemilihan hotel di Kintamani menggunakan metode MOORA. Aplikasi ini dibuat dengan React, TypeScript, Vite, Tailwind CSS, React Router, Lucide Icons, dan Recharts.

## Cara Menjalankan Aplikasi

### Kebutuhan

- Node.js
- npm
- Backend `spk-hotel-moora-service-go` sudah berjalan

### Install Dependency

```powershell
npm install
```

### Setup Environment

Salin environment contoh:

```powershell
Copy-Item .\.env.example .\.env
```

Isi URL backend:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Jalankan Development Server

```powershell
npm run dev
```

Frontend berjalan pada:

```text
http://127.0.0.1:5173
```

### Build Production

```powershell
npm run build
```

### Preview Build

```powershell
npm run preview
```

## Struktur File

```text
index.html
  Entry HTML Vite dan konfigurasi favicon.

src/main.tsx
  Entry React, memasang BrowserRouter dan AuthProvider.

src/App.tsx
  Definisi route publik, route admin, route user, dan redirect berdasarkan role.

src/assets
  Asset gambar seperti hero Kintamani dan logo.

src/components/auth
  Komponen layout halaman login/register.

src/components/domain
  Komponen khusus domain sistem, seperti form hotel, form kriteria, tabel rekomendasi, dan chart.

src/components/layout
  Layout setelah login, sidebar, topbar, dan protected route.

src/components/ui
  Komponen UI umum yang dipakai berulang, seperti Button, Card, Badge, Alert, TableShell, LoadingState, dan EmptyState.

src/context
  AuthContext untuk menyimpan user login, token, login, register, logout, dan refresh profil.

src/pages
  Folder halaman aplikasi. Setiap halaman besar dibuat dalam folder sendiri.

src/services
  Fungsi komunikasi ke backend API.

src/styles
  CSS global dan konfigurasi dasar Tailwind.

src/types
  TypeScript type untuk response API, hotel, kriteria, rekomendasi, user, dan auth.

src/utils
  Helper format angka, mata uang, dan tanggal.
```

## Penjelasan Pages

### LandingPage

Halaman awal aplikasi sebelum login. Menampilkan identitas SPK Hotel Kintamani, tombol login, dan ringkasan konsep sistem.

Route:

```text
/
```

### LoginPage

Halaman masuk admin dan user. Setelah login berhasil, user diarahkan berdasarkan role:

- Admin ke `/admin/dashboard`
- User ke `/hotels`

Route:

```text
/login
```

### RegisterPage

Halaman pendaftaran user baru. Setelah register berhasil, aplikasi langsung login otomatis dan mengarahkan user ke halaman user.

Route:

```text
/register
```

### AdminDashboardPage

Dashboard admin berisi ringkasan sistem:

- Total hotel.
- Total kriteria.
- Total pengguna.
- Rekomendasi terbaik.
- Top rekomendasi hotel.
- Distribusi nilai MOORA.
- Status kelengkapan data.

Route:

```text
/admin/dashboard
```

### AdminHotelsPage

Halaman admin untuk mengelola data hotel.

Fungsi utama:

- Melihat daftar hotel.
- Membuka popup form tambah hotel.
- Mengubah data hotel.
- Menghapus hotel.
- Mengisi nilai hotel untuk setiap kriteria aktif.
- Validasi angka untuk harga dan nilai desimal.

Route:

```text
/admin/hotels
```

### AdminCriteriaPage

Halaman admin untuk mengelola kriteria MOORA.

Fungsi utama:

- Melihat daftar kriteria.
- Tambah kriteria.
- Ubah kriteria.
- Hapus kriteria.
- Menentukan atribut `benefit` atau `cost`.
- Mengatur bobot kriteria.

Route:

```text
/admin/criteria
```

### AdminCriteriaWeightsPage

Halaman admin untuk melihat bobot kriteria dan bobot normalisasi. Halaman ini membantu admin memeriksa apakah distribusi bobot kriteria sudah sesuai sebelum proses MOORA dijalankan.

Route:

```text
/admin/criteria/weights
```

### AdminMooraPage

Halaman proses MOORA admin. Halaman ini fokus pada proses perhitungan:

- Menjalankan hitung MOORA.
- Melihat jumlah hotel yang dihitung.
- Melihat detail nilai normalisasi dan nilai terbobot.
- Melihat hasil ranking terbaru.

Route:

```text
/admin/moora
```

### AdminUsersPage

Halaman admin untuk mengelola pengguna.

Fungsi utama:

- Melihat daftar pengguna.
- Mengubah role pengguna lain.
- Mengaktifkan atau menonaktifkan pengguna lain.
- Card validasi sebelum perubahan role/status dikirim ke backend.
- Akun admin yang sedang digunakan dikunci agar tidak mengubah dirinya sendiri.

Route:

```text
/admin/users
```

### UserHotelsPage

Halaman user untuk melihat daftar hotel yang tersedia.

Route:

```text
/hotels
```

### UserPreferencesPage

Halaman user untuk mengatur preferensi sebelum rekomendasi dihitung.

Preferensi yang dapat diatur:

- Maksimal budget.
- Minimal rating/fasilitas.
- Minimal aksesibilitas.
- Maksimal jarak.
- Minimal view.

Route:

```text
/preferences
```

### UserRecommendationsPage

Halaman user untuk melihat hasil rekomendasi hotel berdasarkan preferensi dan perhitungan MOORA.

Route:

```text
/recommendations
```

### ProfilePage

Halaman profil user login.

Route:

```text
/profile
```

### NotFoundPage

Fallback ketika route tidak tersedia.

Route:

```text
*
```

## Penjelasan Components

### Auth Components

Lokasi:

```text
src/components/auth
```

Berisi komponen halaman auth:

- `AuthShell`
- `AuthCard`
- `AuthTextInput`
- `AuthPasswordInput`
- `AuthAlert`
- `AuthSubmitButton`
- `AuthFooterLink`

### Layout Components

Lokasi:

```text
src/components/layout
```

Fungsi:

- `AppLayout`: membungkus halaman setelah login.
- `Sidebar`: menu admin/user berdasarkan role.
- `Topbar`: area header kanan/kiri setelah login.
- `ProtectedRoute`: menjaga route agar hanya bisa diakses user login dan role tertentu.

### UI Components

Lokasi:

```text
src/components/ui
```

Komponen reusable:

- `Button`
- `Card`
- `Badge`
- `Alert`
- `EmptyState`
- `LoadingState`
- `FormField`
- `PageHeader`
- `TableShell`

### Domain Components

Lokasi:

```text
src/components/domain
```

Komponen yang spesifik untuk sistem:

- `HotelForm`: form tambah/ubah hotel dan nilai kriteria.
- `CriterionForm`: form tambah/ubah kriteria.
- `RecommendationTable`: tabel ranking rekomendasi.
- `RecommendationChart`: visualisasi hasil rekomendasi.

## Services dan Endpoint

Base API diatur dari:

```text
VITE_API_BASE_URL
```

Default:

```text
http://localhost:8080/api/v1
```

Token JWT disimpan oleh `tokenStorage` dan dikirim otomatis melalui `apiClient`.

### Auth Service

File:

```text
src/services/authService.ts
```

Endpoint:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user/admin |
| GET | `/auth/me` | Ambil profil user login |

### Hotel Service

File:

```text
src/services/hotelService.ts
```

Endpoint:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/hotels` | Ambil daftar hotel |
| GET | `/hotels/:id` | Ambil detail hotel |
| POST | `/hotels` | Tambah hotel |
| PUT | `/hotels/:id` | Ubah hotel |
| DELETE | `/hotels/:id` | Hapus hotel |

### Criterion Service

File:

```text
src/services/criterionService.ts
```

Endpoint:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/criteria` | Ambil daftar kriteria |
| GET | `/criteria/:id` | Ambil detail kriteria |
| POST | `/criteria` | Tambah kriteria |
| PUT | `/criteria/:id` | Ubah kriteria |
| DELETE | `/criteria/:id` | Hapus kriteria |

### Preference Service

File:

```text
src/services/preferenceService.ts
```

Endpoint:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| POST | `/preferences` | Simpan preferensi user |
| GET | `/preferences/latest` | Ambil preferensi terbaru |

### Recommendation Service

File:

```text
src/services/recommendationService.ts
```

Endpoint:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| POST | `/recommendations/calculate` | Hitung ranking MOORA |
| GET | `/recommendations/latest` | Ambil hasil ranking terakhir |

### Dashboard Service

File:

```text
src/services/dashboardService.ts
```

Endpoint:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/dashboard/summary` | Ambil ringkasan dashboard admin |

### User Service

File:

```text
src/services/userService.ts
```

Endpoint:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/users` | Ambil daftar pengguna |
| PATCH | `/users/:id/role` | Ubah role pengguna |
| PATCH | `/users/:id/status` | Ubah status aktif pengguna |

## Rumus Perhitungan MOORA

Perhitungan utama dilakukan di backend. Frontend menampilkan input, tombol proses, tabel ranking, dan detail nilai hasil perhitungan.

### 1. Alternatif

Alternatif adalah hotel:

```text
A_i = hotel ke-i
```

### 2. Kriteria

Kriteria berasal dari data admin:

```text
C_j = kriteria ke-j
w_j = bobot kriteria
```

Kriteria memiliki atribut:

- `benefit`: nilai lebih besar lebih baik.
- `cost`: nilai lebih kecil lebih baik.

### 3. Normalisasi Bobot

```text
W_j = w_j / total_w
```

dengan:

```text
total_w = w_1 + w_2 + ... + w_n
```

### 4. Matriks Keputusan

Nilai hotel pada setiap kriteria:

```text
x_ij = nilai hotel i pada kriteria j
```

### 5. Normalisasi Matriks

```text
r_ij = x_ij / sqrt(sum(x_ij^2))
```

Pembagi dihitung per kolom kriteria:

```text
sqrt(x_1j^2 + x_2j^2 + ... + x_mj^2)
```

### 6. Nilai Terbobot

```text
v_ij = r_ij * W_j
```

### 7. Nilai Preferensi

```text
Y_i = sum(v_ij benefit) - sum(v_ij cost)
```

### 8. Ranking

Hotel diurutkan dari nilai `Y_i` terbesar ke terkecil.

```text
Y terbesar = rekomendasi terbaik
```

Jika user memiliki preferensi, backend menyaring hotel terlebih dahulu, lalu MOORA dihitung pada hotel yang lolos filter.

## Fitur

- Landing page terang dengan tema biru.
- Login dan register.
- Register otomatis login setelah berhasil.
- Route protected berdasarkan role.
- Sidebar admin/user.
- Dashboard admin.
- CRUD hotel dengan popup form.
- CRUD kriteria dengan popup form.
- Kriteria dan nilai hotel bersifat dinamis.
- Validasi input angka pada form hotel dan preferensi.
- Proses perhitungan MOORA admin.
- Hasil ranking rekomendasi admin dan user.
- Preferensi user sebelum rekomendasi.
- Tabel dan visualisasi rekomendasi.
- Pengelolaan pengguna oleh admin.
- Card validasi sebelum ubah role atau status pengguna.
- Favicon logo Undiksha.
