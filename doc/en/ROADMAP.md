# Roadmap & Future Requests (Rencana Pengembangan)

Dokumen ini berisi daftar fitur yang direncanakan untuk membuat **Lapeh Framework** setara dengan framework backend enterprise lainnya (seperti NestJS, Laravel, atau Django).

Ini adalah **Undangan Terbuka** bagi para kontributor! Jika Anda tertarik mengerjakan salah satu fitur di bawah ini, silakan buat Issue/PR.

---

## 🏗️ Core & Architecture

### 1. Dependency Injection (DI) Container
*   **Tujuan**: Membuat kode lebih testable dan modular.
*   **Konsep**: Saat ini Lapeh menggunakan pendekatan import langsung. Implementasi DI sederhana (seperti `InversifyJS` atau custom container) akan memudahkan unit testing dan decoupling.
*   **Inspirasi**: NestJS Providers, Angular DI.

### 2. Event Emitter (Pub/Sub)
*   **Tujuan**: Decoupling logic antar modul.
*   **Contoh**: Saat user register -> Emit event `UserRegistered` -> Listener `SendWelcomeEmail` & `CreateWallet` berjalan terpisah.
*   **Status**: Belum ada (bisa pakai `eventemitter3`).

### 3. API Documentation Generator (Swagger/OpenAPI)
*   **Tujuan**: Auto-generate dokumentasi API interaktif.
*   **Rencana**: Membaca file route dan validator schema, lalu men-generate spesifikasi Swagger UI secara otomatis di `/api/docs`.

---

## 🛠️ Fitur Enterprise (The "Missing" Parts)

### 4. Job Queues & Background Workers
*   **Tujuan**: Memproses tugas berat di background agar tidak memblokir HTTP request.
*   **Teknologi**: Integrasi dengan **BullMQ** (Redis).
*   **Fitur**:
    *   Decorators/Helpers untuk mendefinisikan Job.
    *   Dashboard monitoring job (seperti Horizon di Laravel).
    *   Retry mechanism & Failed job handling.

### 5. Task Scheduling (Cron Jobs)
*   **Tujuan**: Menjalankan tugas berkala (misal: "Kirim rekap email setiap jam 12 malam").
*   **Rencana**: Wrapper di atas `node-cron` yang terintegrasi dengan struktur framework.
*   **CLI**: `npm run schedule:run`.

### 6. Storage Abstraction Layer
*   **Tujuan**: Satu interface untuk upload file ke berbagai provider (Local, AWS S3, Google Cloud Storage, MinIO).
*   **Konsep**:
    ```typescript
    // Tidak peduli drivernya apa, kodenya sama:
    await Storage.disk('s3').put('avatars/1.jpg', fileBuffer);
    ```

### 7. Mailer Service
*   **Tujuan**: Standarisasi pengiriman email.
*   **Fitur**:
    *   Support SMTP, Mailgun, SES.
    *   Support Template Engine (Handlebars/EJS) untuk body email.
    *   Queue integration (kirim email di background).

---

## 🧪 Testing & Quality Assurance

### 8. Native Testing Suite
*   **Tujuan**: Memudahkan user menulis test.
*   **Rencana**:
    *   Integrasi **Vitest** atau **Jest** pre-configured.
    *   Helper untuk HTTP Testing (supertest wrapper).
    *   Helper untuk Database Transaction (rollback setelah test selesai).
    *   Command: `npm run test`, `npm run make:test`.

---

## 🌐 Globalization & Security

### 9. Localization (i18n)
*   **Tujuan**: Mendukung respon API dalam berbagai bahasa.
*   **Fitur**: Mendeteksi header `Accept-Language` dan mengembalikan pesan error/success sesuai bahasa user.

### 10. API Versioning
*   **Tujuan**: Mendukung multiple versi API (v1, v2) tanpa merusak klien lama.
*   **Rencana**: Routing strategy berbasis URL prefix (`/api/v1/...`) atau Header.

---

## 💻 CLI Enhancements

### 11. Interactive CLI (TUI)
*   **Tujuan**: Membuat CLI lebih user friendly.
*   **Ide**: Saat menjalankan `npx lapeh`, muncul menu interaktif untuk memilih fitur yang mau diinstall (pilih DB, pilih mau pakai Redis atau tidak, dll).

---

## Tertarik Berkontribusi?

Pilih salah satu topik di atas, buat Issue di GitHub dengan judul `[Proposal] Nama Fitur`, dan mari kita diskusikan cara implementasinya! 🚀
