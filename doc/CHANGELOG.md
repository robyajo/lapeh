# Dokumentasi Perubahan Lapeh Framework

File ini mencatat semua perubahan, pembaruan, dan perbaikan yang dilakukan pada framework Lapeh, diurutkan berdasarkan tanggal.

## [2025-12-27] - Pembaruan Struktur & Validasi

### 🚀 Fitur Baru
- **Laravel-style Validator**:
  - Implementasi utility `Validator` baru di `src/utils/validator.ts` yang meniru gaya validasi Laravel.
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
