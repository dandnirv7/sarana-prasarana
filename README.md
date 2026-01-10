# Sarana Prasarana

**Sarana Prasarana** adalah sistem manajemen aset modern yang dibangun dengan **Laravel 12** (backend) dan **React 19 (TypeScript)** (frontend). Sistem ini menyediakan antarmuka bersih untuk mengelola aset, peminjaman, pengembalian, dan laporan, memanfaatkan Inertia.js untuk rendering sisi‑server yang mulus serta Ziggy untuk penanganan route di sisi klien.

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

- **Manajemen Aset & Kategori** yang lengkap.
- **Peminjaman & Pengembalian** aset dengan alur persetujuan.
- **Notifikasi Otomatis** melalui email untuk setiap perubahan status peminjaman.
- **Manajemen Pengguna** dengan izin berbasis peran (menggunakan Spatie Laravel Permission).
- **Laporan & Statistik** dengan visualisasi data interaktif.
- **Eksport & Distribusi** data ke format Excel, PDF, dan pengiriman laporan via email.
- **UI Modern** menggunakan Tailwind CSS 4 dan Radix UI.

---

## Teknologi yang Digunakan

| Lapisan     | Teknologi                                      |
| ----------- | ---------------------------------------------- |
| Backend     | Laravel 12, PHP 8.2+, MySQL/PostgreSQL         |
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS 4     |
| Routing     | Inertia.js (v2), Ziggy                         |
| Autentikasi | Laravel Fortify                                |
| Izin        | Spatie Laravel Permission                      |
| Visualisasi | Recharts                                       |
| Ekspor      | Laravel Excel (Maatwebsite), Laravel DOMPDF    |
| Email       | PHPMailer 7                                    |
| UI Library  | Radix UI, Lucide React, Shadcn UI (Components) |
| Pengujian   | PHPUnit, Pest                                  |

---

## Prasyarat

- **Node.js** (>= 20.x) dan **npm**
- **PHP** (>= 8.2) dengan Composer (ext-gd, ext-zip diperlukan untuk Excel/PDF)
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
npm install
```

---

## Konfigurasi

1. **File environment**

    ```bash
    cp .env.example .env
    ```

    Sesuaikan `.env` dengan kredensial database, `APP_URL`, dan konfigurasi SMTP untuk email:

    ```env
    MAIL_HOST=smtp.mailtrap.io
    MAIL_PORT=2525
    MAIL_USERNAME=your_username
    MAIL_PASSWORD=your_password
    MAIL_FROM_ADDRESS="info@saranaprasarana.com"
    MAIL_FROM_NAME="${APP_NAME}"
    ```

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
    npm run dev
    ```

---

## Menjalankan Aplikasi

```bash
# Mulai server development Laravel
php artisan serve

# Di terminal lain, jalankan Vite
npm run dev

# Jika ingin menjalankan kedua perintah di satu terminal
composer run dev
```

Buka `http://127.0.0.1:8000` di browser.

---

## Membuat Build Front‑end

- **Development**: `npm run dev`
- **Production build**: `npm run build`

Build produksi menghasilkan aset teroptimasi di `public/build`.

---

## Pengujian

### Backend

```bash
php artisan test
```

---

## Daftar Fitur

- **Dashboard Interaktif**: Statistik aset, grafik peminjaman, dan ringkasan cepat menggunakan Recharts.
- **Manajemen Aset**: CRUD aset dengan riwayat status (Tersedia, Dipinjam, Rusak, Hilang).
- **Kategori & Status**: Pengelolaan kategori aset dan status kustom.
- **Peminjaman Aset**: Pengajuan peminjaman oleh pengguna dengan sistem persetujuan admin.
- **Notifikasi Email**: Email otomatis dikirim saat peminjaman disetujui, ditolak, atau dikonfirmasi kembali.
- **Pengembalian Aset**: Konfirmasi pengembalian aset dengan pengecekan kondisi (Baik/Rusak/Perbaikan).
- **Laporan Komprehensif**: Filter laporan berdasarkan periode, kategori, dan status.
- **Ekspor Data**: Download data aset, pengguna, peminjaman, dan laporan ke format **Excel (.xlsx)** dan **PDF**.
- **Kirim Laporan via Email**: Fitur untuk mengirim laporan PDF/Excel langsung ke alamat email tujuan.
- **Manajemen Pengguna & Role**: Kendali akses penuh (Admin, Staff, User) menggunakan Spatie Permission.
- **Profil Pengguna**: Update informasi profil dan pengaturan keamanan.
- **Responsif**: Desain yang optimal untuk perangkat desktop maupun mobile.

---

## Daftar Route

Berikut adalah beberapa route utama aplikasi:

| Metode | URL                            | Nama Route              | Deskripsi                              |
| ------ | ------------------------------ | ----------------------- | -------------------------------------- |
| GET    | `/dashboard`                   | `dashboard`             | Dashboard utama.                       |
| GET    | `/asset`                       | `asset.index`           | Daftar aset.                           |
| GET    | `/asset/export/excel`          | `asset.export.excel`    | Export aset ke Excel.                  |
| GET    | `/asset/export/pdf`            | `asset.export.pdf`      | Export aset ke PDF.                    |
| GET    | `/borrowings`                  | `borrowings.index`      | Daftar peminjaman.                     |
| PATCH  | `/borrowings/{id}/approve`     | `borrowings.approve`    | Setujui peminjaman & kirim email.      |
| PATCH  | `/borrowings/{id}/reject`      | `borrowings.reject`     | Tolak peminjaman & kirim email.        |
| POST   | `/borrowings/export-pdf-email` | -                       | Kirim laporan peminjaman PDF ke email. |
| GET    | `/returns`                     | `returns.index`         | Daftar pengembalian.                   |
| PATCH  | `/returns/{id}/return`         | `returns.confirmReturn` | Konfirmasi pengembalian & kondisi.     |
| GET    | `/reports`                     | `reports.index`         | Laporan aset & peminjaman.             |
| GET    | `/reports/export/excel`        | `reports.export.excel`  | Export laporan ke Excel.               |
| GET    | `/users`                       | `users.index`           | Manajemen pengguna.                    |
| GET    | `/users/export/excel`          | `users.export.excel`    | Export daftar pengguna ke Excel.       |
| GET    | `/settings/profile`            | `profile.edit`          | Edit profil pengguna.                  |
| GET    | `/settings/categories`         | `categories.index`      | Kelola kategori aset.                  |
| GET    | `/settings/statuses`           | `statuses.index`        | Kelola status aset.                    |

---

## Deploy

1. **Build aset**: `npm run build`
2. **Upload repository** ke server produksi.
3. **Set environment variables** (.env).
4. **Jalankan migrasi**: `php artisan migrate --force`
5. **Set permission**: Pastikan folder `storage` dan `bootstrap/cache` dapat ditulis.
6. **Optimasi**:
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

---

## Kontribusi

1. Fork Repo.
2. Create Feature Branch.
3. Commit Changes.
4. Push to Branch.
5. Open Pull Request.

---

## Lisensi

Proyek ini dilisensikan di bawah **MIT License**.
