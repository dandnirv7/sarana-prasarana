# Sarana Prasarana

**Sarana Prasarana** adalah sistem manajemen aset modern yang dibangun dengan **Laravel** (backend) dan **React (TypeScript)** (frontend). Sistem ini menyediakan antarmuka bersih untuk mengelola aset, pengguna, dan izin, memanfaatkan Inertia.js untuk rendering sisi‑server yang mulus serta Ziggy untuk penanganan route di sisi klien.

---

## Daftar Isi

- [Gambaran Proyek](#gambaran-proyek)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Membuat Build Front‑end](#membuat-build-front‑end)
- [Pengujian](#pengujian)
- [Daftar Fitur](#daftar-fitur)
- [Daftar Route](#daftar-route)
- [Deploy](#deploy)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Gambaran Proyek

Sarana Prasarana membantu organisasi melacak aset fisik mereka (misalnya peralatan, fasilitas, inventaris). Fitur utama meliputi:

- **CRUD Aset** dengan manajemen kategori.
- **Manajemen Pengguna** dengan izin berbasis peran (menggunakan paket Spatie Laravel Permission).
- **UI Dinamis** yang didukung komponen React berbasis TypeScript.
- **Inertia.js** sebagai jembatan untuk pengalaman single‑page‑app sambil tetap menggunakan routing Laravel.
- **Ziggy** untuk menghasilkan route secara tipe‑aman di sisi klien.

---

## Teknologi yang Digunakan

| Lapisan     | Teknologi                                   |
| ----------- | ------------------------------------------- |
| Backend     | Laravel 10, PHP 8.2, MySQL/PostgreSQL       |
| Frontend    | React 18, TypeScript, Vite                  |
| Routing     | Inertia.js, Ziggy                           |
| Autentikasi | Laravel Breeze (atau Jetstream)             |
| Izin        | Spatie Laravel Permission                   |
| Pengujian   | PHPUnit, Pest, Jest                         |
| CI/CD       | GitHub Actions (contoh workflow disertakan) |

---

## Prasyarat

- **Node.js** (>= 18.x) dan **npm** (atau **yarn**)
- **PHP** (>= 8.2) dengan Composer
- **Database** (MySQL 8.x atau PostgreSQL 13+)
- **Git**

---

## Instalasi

```bash
# Clone repository
git clone https://github.com/yourusername/sarana-prasarana.git
cd sarana-prasarana

# Install dependensi PHP
composer install

# Install dependensi Node
npm install   # atau `yarn`
```

---

## Konfigurasi

1. **File environment**

    ```bash
    cp .env.example .env
    ```

    Sesuaikan `.env` dengan kredensial database, `APP_URL`, dsb.

2. **Generate key aplikasi**

    ```bash
    php artisan key:generate
    ```

3. **Jalankan migrasi & seeder**

    ```bash
    php artisan migrate:fresh --seed
    ```

4. **Buat symbolic link untuk storage**

    ```bash
    php artisan storage:link
    ```

5. **Kompilasi aset front‑end (development)**
    ```bash
    npm run dev   # hot‑reload dengan Vite
    ```

---

## Menjalankan Aplikasi

```bash
# Mulai server development Laravel
php artisan serve

# Di terminal lain, jalankan Vite (jika belum berjalan)
npm run dev
```

Buka `http://127.0.0.1:8000` di browser. Komponen React disajikan melalui Vite dan terintegrasi lewat Inertia.

---

## Membuat Build Front‑end

- **Development (watch mode)**: `npm run dev`
- **Production build**: `npm run build`

Build produksi menghasilkan aset teroptimasi di `public/build`.

---

## Pengujian

### Backend

```bash
php artisan test   # menjalankan tes PHPUnit / Pest
```

### Frontend

```bash
npm run test   # menjalankan tes Jest (jika sudah dikonfigurasi)
```

---

## Daftar Fitur

- **Manajemen Aset**: Tambah, edit, hapus, dan lihat detail aset.
- **Kategori Aset**: Buat dan kelola kategori aset.
- **Manajemen Pengguna**: CRUD pengguna lengkap dengan foto profil.
- **Peran & Izin**: Atur peran (admin, manager, staff) dan izin spesifik menggunakan Spatie Permission.
- **Dashboard Interaktif**: Statistik aset, grafik, dan ringkasan cepat.
- **Pencarian & Filter**: Cari aset berdasarkan nama, kategori, atau status.
- **Ekspor Data**: Export aset ke CSV/Excel.
- **Notifikasi Real‑time** (opsional): Notifikasi saat aset ditambahkan atau diubah.
- **Responsif & Mobile Friendly**: UI yang beradaptasi dengan semua ukuran layar.
- **Integrasi Inertia.js**: Pengalaman SPA tanpa kehilangan kekuatan Laravel.
- **Route Type‑Safe dengan Ziggy**: Menghindari kesalahan penulisan route di client.

---

## Daftar Route

Berikut adalah contoh route utama yang tersedia (didefinisikan di `routes/web.php`):

| Metode    | URL                 | Nama Route         | Deskripsi                           |
| --------- | ------------------- | ------------------ | ----------------------------------- |
| GET       | `/`                 | `home`             | Halaman beranda/dashboard.          |
| GET       | `/login`            | `login`            | Form login.                         |
| POST      | `/login`            | `login.attempt`    | Proses autentikasi.                 |
| POST      | `/logout`           | `logout`           | Logout pengguna.                    |
| GET       | `/register`         | `register`         | Form pendaftaran (jika diaktifkan). |
| POST      | `/register`         | `register.store`   | Simpan pengguna baru.               |
| GET       | `/assets`           | `assets.index`     | Daftar semua aset.                  |
| GET       | `/assets/create`    | `assets.create`    | Form tambah aset.                   |
| POST      | `/assets`           | `assets.store`     | Simpan aset baru.                   |
| GET       | `/assets/{id}`      | `assets.show`      | Detail aset.                        |
| GET       | `/assets/{id}/edit` | `assets.edit`      | Form edit aset.                     |
| PUT/PATCH | `/assets/{id}`      | `assets.update`    | Update aset.                        |
| DELETE    | `/assets/{id}`      | `assets.destroy`   | Hapus aset.                         |
| GET       | `/categories`       | `categories.index` | Daftar kategori aset.               |
| GET       | `/users`            | `users.index`      | Daftar pengguna.                    |
| GET       | `/users/create`     | `users.create`     | Form tambah pengguna.               |
| POST      | `/users`            | `users.store`      | Simpan pengguna baru.               |
| GET       | `/users/{id}`       | `users.show`       | Detail pengguna.                    |
| GET       | `/users/{id}/edit`  | `users.edit`       | Form edit pengguna.                 |
| PUT/PATCH | `/users/{id}`       | `users.update`     | Update pengguna.                    |
| DELETE    | `/users/{id}`       | `users.destroy`    | Hapus pengguna.                     |
| GET       | `/roles`            | `roles.index`      | Daftar peran.                       |
| POST      | `/roles/assign`     | `roles.assign`     | Assign peran ke pengguna.           |

> **Catatan**: Route tambahan untuk API (`/api/*`) atau fitur khusus dapat ditemukan di file `routes/api.php`.

---

## Deploy

1. **Build aset**
    ```bash
    npm run build
    ```
2. **Upload repository** ke server produksi.
3. **Set environment variables** pada server.
4. **Jalankan migrasi**
    ```bash
    php artisan migrate --force
    ```
5. **Konfigurasi web server** (NGINX/Apache) untuk men‑point ke direktori `public`.
6. **Opsional**: Gunakan **Supervisor** untuk queue worker dan **Laravel Horizon** untuk Redis queue.

Contoh workflow CI/CD dengan GitHub Actions (`.github/workflows/ci.yml`) sudah disertakan di repo.

---

## Kontribusi

Kontribusi sangat kami hargai! Ikuti langkah berikut:

1. Fork repository.
2. Buat branch fitur: `git checkout -b feature/fitur-anda`.
3. Tulis kode dan **tambahkan tes**.
4. Pastikan semua tes lulus.
5. Buat Pull Request dengan deskripsi perubahan yang jelas.

Harap ikuti standar kode yang ada (PSR‑12 untuk PHP, ESLint/Prettier untuk TypeScript).

---

## Lisensi

Proyek ini dilisensikan di bawah **MIT License** – lihat file [LICENSE](LICENSE) untuk detailnya.

---
