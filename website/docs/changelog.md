# Dokumentasi Perubahan Lapeh Framework

File ini mencatat semua perubahan, pembaruan, dan perbaikan yang dilakukan pada framework Lapeh, diurutkan berdasarkan tanggal.

## [2025-12-28] - Minggu, 28 Desember 2025 - Perbaikan Upgrade & Testing (v2.4.9)

### 🚀 Fitur & Perbaikan

- **Smart Upgrade CLI**:

  - Memperbarui perintah `npx lapeh upgrade` agar melakukan sinkronisasi penuh (mirroring).
  - File yang dihapus di versi terbaru framework sekarang akan otomatis dihapus juga dari proyek pengguna, menjaga proyek tetap bersih.
  - Menghapus folder `bin` dari proses sinkronisasi ke proyek pengguna karena folder tersebut dikelola oleh paket.

- **Dukungan Testing Komprehensif**:
  - Konfigurasi `tsconfig.json` diperbarui untuk mendukung path alias `@lapeh/*` di dalam folder `tests`.
  - Folder `tests` sekarang dikecualikan dari proses build produksi (via `tsconfig.build.json`), menghasilkan folder `dist/` yang lebih bersih.
  - Dokumentasi dan konfigurasi Jest telah disesuaikan untuk integrasi yang mulus.

## [2025-12-28] - Minggu, 28 Desember 2025 - Perbaikan Kompatibilitas & Automasi

### 🛠️ Perbaikan Bug (Bug Fixes)

- **Linux/Mac Path Compatibility (v2.4.1)**:

  - Memperbaiki masalah `MODULE_NOT_FOUND` pada sistem operasi Linux dan macOS ketika path proyek mengandung spasi (misalnya: `/Folder Saya/Proyek Lapeh`).
  - Mengubah logika escaping argumen pada `nodemon` di `bin/index.js` agar menggunakan _single quotes_ pada sistem berbasis Unix.

- **Auto Prisma Generate (v2.4.2)**:

  - Memperbaiki error `Cannot find module '.prisma/client/default'` yang sering muncul setelah instalasi bersih.
  - Menambahkan eksekusi otomatis `npx prisma generate` saat menjalankan perintah `npm run dev` dan `npm run build`.
  - Memastikan Prisma Client selalu tersedia sebelum server berjalan, meningkatkan pengalaman pengguna baru.

- **PM2 Ecosystem Config (v2.4.4)**:
  - Menambahkan file `ecosystem.config.js` secara otomatis ke dalam proyek baru dan proyek yang di-upgrade.
  - File ini berisi konfigurasi siap pakai untuk menjalankan aplikasi dalam mode **Cluster** (load balancing) di production menggunakan PM2.
  - Memperbarui dokumentasi `doc/DEPLOYMENT.md` dengan instruksi penggunaan PM2 yang baru.

## [2025-12-27] - Code Quality & Standardization Update

### 🚀 Fitur & Standarisasi

- **Standardized Import Paths**:
  - Implementasi path alias `@/` untuk import yang lebih bersih (e.g., `import { prisma } from "@/core/database"`).
  - Penghapusan penggunaan relative paths yang dalam (`../../../`).
  - Konfigurasi `tsconfig.json` tanpa `baseUrl` (mengikuti standar TypeScript 6.0+).
- **Strict Linting & Code Quality**:
  - Implementasi aturan **ESLint** ketat untuk mencegah "Dead Code".
  - Error otomatis untuk variabel, parameter, dan import yang tidak digunakan (`no-unused-vars`).
  - Script `npm run lint` dan `npm run lint:fix` untuk pembersihan kode otomatis.
- **Fastify-Style Standardization**:
  - Penerapan standar respon cepat (`sendFastSuccess`) di seluruh controller (`AuthController`, `RbacController`, `PetController`).
  - Penggunaan **Schema-based Serialization** untuk performa JSON maksimal.
  - Konversi otomatis `BigInt` ke `string` dalam respon JSON.

## [2025-12-27] - High Performance & Scalability Update

### 🚀 Fitur Baru

- **High Performance Serialization (Fastify-Style)**:
  - Implementasi `fast-json-stringify` untuk serialisasi JSON super cepat (2x-3x lebih cepat dari `JSON.stringify`).
  - Helper `sendFastSuccess` di `src/utils/response.ts` untuk mem-bypass overhead Express.
  - Caching schema serializer otomatis di `src/core/serializer.ts`.
- **Scalability & Clustering**:
  - Dukungan **Load Balancing** dengan Nginx.
  - Dukungan **Redis Clustering** untuk Rate Limiter (`rate-limit-redis`).
  - File konfigurasi `docker-compose.cluster.yml` untuk simulasi cluster lokal (1 Nginx + 2 App Instances + 1 Redis).
- **Smart Error Handling**:
  - Deteksi otomatis port bentrok (`EADDRINUSE`) saat startup.
  - Memberikan saran command _copy-paste_ untuk mematikan process yang memblokir port (support Windows, Mac, Linux).
- **SEO Optimization**:
  - Update metadata `package.json` dan `README.md` agar framework lebih mudah ditemukan di Google/NPM.

## [2025-12-27] - Pembaruan Struktur & Validasi

### 🚀 Fitur Baru

- **Expressive Validator**:
  - Implementasi utility `Validator` baru di `src/utils/validator.ts` dengan gaya validasi yang lebih ekspresif.
  - Mendukung rule string seperti `required|string|min:3|email`.
  - Penambahan rule `unique` untuk pengecekan database otomatis (Prisma).
  - Penambahan rule `mimes`, `image`, `max` (file size) untuk validasi upload file.
  - Penambahan rule `sometimes` untuk field opsional.
- **Framework Hardening (Keamanan & Stabilitas)**:
  - **Rate Limiting**: Middleware anti-spam/brute-force di `src/middleware/rateLimit.ts`.
  - **Request Logger**: Pencatatan log request masuk di `src/middleware/requestLogger.ts`.
  - **Health Check**: Endpoint `/` kini mengembalikan status kesehatan server.
  - **Graceful Shutdown**: Penanganan penutupan koneksi Database dan Redis yang aman saat server berhenti (`SIGTERM`/`SIGINT`).
  - **Environment Validation**: Validasi variabel `.env` wajib (seperti `DATABASE_URL`, `JWT_SECRET`) saat startup.
- **Struktur Folder Baru**:
  - Pemisahan konfigurasi inti ke `src/core/` (`server.ts`, `database.ts`, `redis.ts`, `realtime.ts`) agar folder `src` lebih bersih.
  - Sentralisasi route di `src/routes/index.ts` (WIP).
- **CLI Improvements**:
  - `npx lapeh <project-name> --full` kini otomatis menjalankan server dev setelah instalasi selesai, sehingga user bisa langsung melihat hasil tanpa mengetik perintah tambahan.

### 🛠️ Perbaikan & Refactoring

- **Controller Refactoring**:
  - `AuthController`: Migrasi ke `Validator` baru, termasuk validasi upload avatar.
  - `PetController`: Migrasi ke `Validator` baru.
  - `RbacController`: Migrasi sebagian ke `Validator` baru.
- **Pembersihan**:
  - Penghapusan folder `src/schema/` (Zod schema lama) karena sudah digantikan oleh `Validator` utility.
  - Penghapusan file duplikat/lama di root `src/` setelah migrasi ke `src/core/`.

### 📝 Catatan Teknis

- **Validator Async**: Method `fails()`, `passes()`, dan `validated()` kini bersifat `async` untuk mendukung pengecekan database (`unique`).
- **Type Safety**: Semua perubahan telah diverifikasi dengan `npm run typecheck`.

---
