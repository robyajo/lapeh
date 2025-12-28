# Rilis Lapeh v2.4.11: Multi-Database Support & Clean Architecture

_Ditulis pada 28 Desember 2025 oleh robyajo_

Akhir pekan yang produktif! Kami dengan bangga merilis **Lapeh v2.4.11** yang membawa fleksibilitas database ke level berikutnya dan memastikan paket yang Anda instal jauh lebih bersih dan ringan.

## Apa yang Baru?

### 1. Multi-Database Support (CLI)

Sebelumnya, Lapeh berfokus pada PostgreSQL. Sekarang, kami memberikan kebebasan penuh kepada Anda untuk memilih database favorit Anda langsung saat inisialisasi project.

- **MongoDB & MySQL**: Kini didukung penuh sebagai warga kelas satu (first-class citizen) di Lapeh.
- **Otomatisasi Cerdas**:
  - `npx lapeh init my-project --db-type=mongo` akan mengkonfigurasi project untuk MongoDB.
  - Logika migrasi disesuaikan otomatis: `prisma db push` untuk MongoDB (karena skema fleksibel) dan `prisma migrate dev` untuk SQL databases.
  - Connection string (`DATABASE_URL`) di-generate secara otomatis sesuai provider yang dipilih.

### 2. Clean Architecture & Package

Kami melakukan "bersih-bersih" besar-besaran pada paket distribusi Lapeh di NPM.

- **Lebih Ringan**: File-file sisa pengembangan (`test-local-run`, `init`, dll) dihapus dari paket publik.
- **Lisensi Jelas**: File `LICENSE` (MIT) kini disertakan secara eksplisit di dalam paket, memberikan kepastian hukum untuk penggunaan di project komersial maupun open source.
- **Stabilitas**: Perbaikan pada regex penggantian provider database memastikan template `schema.prisma` Anda selalu valid, apa pun database yang Anda pilih.

### 3. Dokumentasi & Website

- **Admin Dashboard**: Kami mulai meletakkan dasar untuk dokumentasi Admin Dashboard yang akan datang.
- **Telemetry Simulation**: Penambahan tools untuk pengembangan website dokumentasi yang lebih baik.

## Cara Upgrade

Bagi pengguna baru, cukup jalankan:

```bash
npx lapeh init my-project
```

Bagi pengguna lama yang ingin mencoba fitur baru (terutama jika ingin migrasi database), kami sarankan membuat project baru untuk melihat struktur konfigurasi database yang baru, lalu memigrasikan kode logika Anda.

Terima kasih telah menjadi bagian dari perjalanan Lapeh Framework!
