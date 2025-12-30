# Referensi Package & Dependencies

Dokumen ini menjelaskan fungsi dari setiap library (package) yang terinstall di Lapeh Framework, sehingga Anda mengerti kegunaan "alat-alat" yang ada di dalam kotak peralatan Anda.

## Core Framework (Fondasi)

Package-package ini adalah nyawa dari framework ini.

| Package | Deskripsi | Kenapa Kita Pakai? |
| :--- | :--- | :--- |
| **`express`** | Web Framework untuk Node.js. | Standar industri, ringan, dan komunitasnya terbesar. |
| **`dotenv`** | Memuat variabel dari file `.env`. | Agar konfigurasi rahasia (DB password, API Key) tidak di-hardcode. |
| **`cors`** | Cross-Origin Resource Sharing. | Mengizinkan frontend (React/Vue) dari domain berbeda untuk mengakses API kita. |
| **`helmet`** | Middleware keamanan HTTP headers. | Melindungi aplikasi dari serangan umum (XSS, Clickjacking) dengan mengatur header HTTP secara otomatis. |

## Database & ORM

| Package | Deskripsi | Kenapa Kita Pakai? |
| :--- | :--- | :--- |
| **`@prisma/client`** | Query builder & ORM. | Type-safe query database. Autocomplete-nya sangat membantu developer. |
| **`pg`** | Driver PostgreSQL. | Driver native untuk koneksi ke database Postgres. |
| **`@prisma/adapter-*`** | Adapter serverless. | (Opsional) Persiapan untuk deployment ke environment serverless (seperti Vercel/Neon). |

## Authentication & Security

| Package | Deskripsi | Kenapa Kita Pakai? |
| :--- | :--- | :--- |
| **`jsonwebtoken`** | Implementasi JWT. | Standar token untuk autentikasi stateless (API). |
| **`bcryptjs`** | Hashing password. | Mengamankan password user di database (satu arah). |
| **`express-rate-limit`** | Pembatas request. | Mencegah serangan DDoS ringan atau Brute Force login. |

## Utilities & Helper

| Package | Deskripsi | Kenapa Kita Pakai? |
| :--- | :--- | :--- |
| **`zod`** | Schema validation library. | Memvalidasi input user (req.body) dengan syntax yang kuat dan mudah dibaca. |
| **`fast-json-stringify`** | Serializer JSON cepat. | Mengubah object ke JSON string 2x-3x lebih cepat dari `JSON.stringify` bawaan. |
| **`uuid`** | Generator ID unik. | Membuat string acak unik (UUID v4). |
| **`slugify`** | String formatter. | Mengubah "Judul Artikel Keren" menjadi `judul-artikel-keren` (URL friendly). |
| **`multer`** | Middleware upload file. | Menangani `multipart/form-data` untuk upload gambar/dokumen. |
| **`winston`** | Logger library. | Mencatat log aplikasi (error/info) ke file atau console dengan format rapi. |

## Realtime & Caching

| Package | Deskripsi | Kenapa Kita Pakai? |
| :--- | :--- | :--- |
| **`socket.io`** | Library WebSocket. | Fitur komunikasi real-time dua arah (chat, notifikasi live). |
| **`ioredis`** | Client Redis yang robust. | Driver terbaik untuk Redis di Node.js. |
| **`ioredis-mock`** | Simulasi Redis di memori. | Memungkinkan development tanpa perlu install Redis server asli (sangat berguna untuk pemula). |

## Development Tools (DevDependencies)

Package ini hanya dipakai saat koding, tidak ikut terinstall di server production.

| Package | Deskripsi | Fungsi |
| :--- | :--- | :--- |
| **`typescript`** | Compiler TS. | Mengubah kode `.ts` menjadi `.js`. |
| **`nodemon`** | Auto-restarter. | Restart server otomatis setiap kita save file. |
| **`eslint`** | Linter (Polisi Kode). | Mencari potensi error dan variabel yang tidak terpakai. |
| **`@types/*`** | Type Definitions. | Provides intellisense (code suggestions) for plain JavaScript libraries. |
| **`tsc-alias`** | Path resolver. | Resolves `@/core` aliases to relative `../core` paths during production build. |

---

Dengan memahami daftar ini, Anda tahu persis apa yang terjadi di balik layar aplikasi Anda. Tidak ada "Bloatware", setiap package punya tujuan spesifik.
