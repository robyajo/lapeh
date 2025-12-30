# Dokumentasi Perubahan Lapeh Framework

File ini mencatat semua perubahan, pembaruan, dan perbaikan yang dilakukan pada framework Lapeh, diurutkan berdasarkan tanggal.

## [2025-12-30] - Tuesday, December 30, 2025 - Documentation & CLI (v3.0.7)

### 📚 Documentation

- **Project Structure Guide**: Comprehensive update to `STRUCTURE.md` to accurately reflect the No-ORM architecture and Core folder separation.
- **Scripts Documentation**: Added detailed explanation for `release.js` and `make-module.js` automation scripts.

### 🛠️ CLI Improvements

- **Cleanup**: Improved `init` and `upgrade` commands to better handle legacy configuration files.

## [2025-12-30] - Tuesday, December 30, 2025 - Major Release v3.0.0 (No-ORM)

### ⚠️ Breaking Changes

- **Prisma ORM Removal**: Lapeh Framework now **no longer includes a built-in ORM**. We provide full freedom for users to choose their own database stack (TypeORM, Drizzle, etc).
- **CLI Updates**:
  - `init`: No longer asks for database configuration.
  - `make:module`: No longer creates `.model.ts` files instead of `.prisma`.
  - Removed `compile-schema.js` script and related schema splitting logic.

### 🚀 Features & Refactor

- **In-Memory Mock Data**: Built-in modules (Auth, RBAC, Pets) now use in-memory dummy data for demonstration without database setup.
- **Redis Caching**: Redis caching implementation on Pets controller.
- **Documentation**: Comprehensive update to documentation to reflect database agnostic philosophy.

## ⚠️ Deprecated Versions

Starting from release v3.0.0, all previous versions (v1.x and v2.x) are considered **DEPRECATED**. There will be no further feature updates or bug fixes for these versions unless for critical security issues. Users are strongly advised to migrate to v3.0.0.

## [2025-12-29] - Monday, December 29, 2025 - CLI Init Bug Fix (v2.6.7)

### 🛠️ Bug Fixes

- **CLI `init` Command**:
  - **Prisma Client Generation**: Fixed `MODULE_NOT_FOUND` error for `.prisma/client/default` during seeding by forcing `npx prisma generate` before the seed process.
  - **Project Name Parsing**: Fixed a critical bug where running `npx lapeh init <project-name>` would incorrectly interpret `init` as the project name.
  - **Dependency Management**: Reverted to **Prisma v6** (`^6.0.0`) and removed `prisma.config.ts` to resolve `PrismaClientConstructorValidationError` ("engine type client" error) on Windows environments. This restores standard `schema.prisma` configuration with `url = env("DATABASE_URL")`.
  - **Peer Dependencies**: Removed `peerDependencies` from generated projects to prevent package manager conflicts.

## [2025-12-29] - Monday, December 29, 2025 - Upgrade CLI Improvements & MongoDB Support (v2.6.6)

### 🚀 Features & Improvements

- **Enhanced CLI `upgrade` Command**:

  - The `upgrade` command now intelligently detects and preserves local `file:` dependencies in `package.json`. This is critical for framework contributors and local testing, ensuring that upgrading doesn't overwrite local links with npm versions.
  - Standard users will still receive the latest npm version updates automatically.

- **MongoDB & Prisma Compatibility**:

  - **BigInt Fixes**: Resolved serialization issues where `BigInt` IDs (common in SQL) caused crashes in MongoDB environments. All IDs in `auth` and `rbac` controllers now safely convert to `String` before response.
  - **RBAC Schema**: Added missing RBAC models (`roles`, `permissions`, `user_roles`, `role_permissions`) to the core `prisma/schema.prisma` generation pipeline. This ensures `npx prisma generate` works flawlessly without manual schema adjustments.

- **CLI Initialization Flags**:
  - Added new flags to `npx lapeh init` for faster setup:
    - `--full`: Sets up a complete project with dummy data (users/roles).
    - `--default` (or `--y`): Skips interactive prompts and uses default settings (PostgreSQL).

## [2025-12-28] - Sunday, December 28, 2025 - Multi-Database & Cleanup (v2.4.10)

### 🚀 Features & Improvements

- **Multi-Database Support (CLI)**:

  - Added full support for project initialization with **MongoDB** and **MySQL**, alongside **PostgreSQL**.
  - Fixed database provider replacement logic in `schema.prisma` templates for better accuracy.
  - Added `--db-type=mongo|pgsql|mysql` CLI argument for zero-interaction automated installation.
  - Handled MongoDB migration differences by conditionally using `prisma db push`.

- **Package Cleanup**:

  - Removed unnecessary development files/folders (`test-local-run`, `init`, `framework.md`, etc.) from the public NPM package.
  - Explicitly added the `LICENSE` (MIT) file to the package.
  - Ensured `dist` folder is cleanly regenerated during publication.

- **Documentation & Website**:
  - Added basic admin dashboard structure to the website documentation.
  - Added local telemetry API simulation script for website development.

## [2025-12-28] - Sunday, December 28, 2025 - Upgrade & Testing Improvements (v2.4.9)

### 🚀 Features & Fixes

- **Smart Upgrade CLI**:

  - Updated `npx lapeh upgrade` to perform full synchronization (mirroring).
  - Files removed in the latest framework version are now automatically removed from user projects, keeping them clean.
  - Removed `bin` folder from synchronization as it is managed by the package.

- **Comprehensive Testing Support**:
  - Updated `tsconfig.json` to support `@lapeh/*` path aliases within the `tests` folder.
  - The `tests` folder is now excluded from production builds (via `tsconfig.build.json`), resulting in a cleaner `dist/` folder.
  - Jest documentation and configuration have been adjusted for seamless integration.

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
