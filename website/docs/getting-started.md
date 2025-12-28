# Getting Started with Lapeh Framework

Selamat datang di dokumentasi resmi **Lapeh Framework**. Panduan ini akan membantu Anda memulai instalasi, konfigurasi, dan pemahaman dasar tentang struktur proyek.

## Persyaratan Sistem

Sebelum memulai, pastikan sistem Anda memenuhi persyaratan berikut:

- **Node.js**: Versi 18.x atau lebih baru.
- **Database**: PostgreSQL (Recommended) atau MySQL/MariaDB.
- **Package Manager**: NPM (bawaan Node.js).

## Instalasi

Anda dapat menggunakan `npx` (tanpa instalasi) atau menginstall CLI secara global.

### Opsi 1: Menggunakan npx (Direkomendasikan)

Cara termudah untuk memulai tanpa menginstall apapun.

```bash
# Setup Interaktif Standar
npx lapeh@latest init nama-project-anda
```

### Opsi 2: Instalasi Global CLI

Jika Anda sering membuat project Lapeh, Anda bisa menginstall CLI secara global:

```bash
npm install -g lapeh@latest
```

Setelah terinstall, Anda bisa menggunakan perintah `lapeh` langsung:

```bash
lapeh init nama-project-anda
```

### Pilihan Setup Project

Saat membuat project (baik via `npx` atau global), Anda bisa menggunakan flags berikut:

- **Setup Lengkap** (Termasuk data dummy, disarankan untuk belajar):
  ```bash
  npx lapeh@latest init nama-project-anda --full
  ```

- **Setup Default** (Melewati pertanyaan, menggunakan PostgreSQL):
  ```bash
  npx lapeh@latest init nama-project-anda --y
  ```

### 2. Setup Awal

Setelah project dibuat, masuk ke direktori project dan jalankan setup wizard:

```bash
cd nama-project-anda
npm run first
```

Script ini akan melakukan hal-hal berikut secara otomatis:

1.  Menyalin `.env.example` ke `.env`.
2.  Menginstall semua dependency (`npm install`).
3.  Membuat **JWT Secret** yang aman.
4.  Menjalankan migrasi database (membuat tabel).
5.  Menjalankan seeder (mengisi data awal).

### 3. Jalankan Server Development

```bash
npm run dev
```

Server akan berjalan di `http://localhost:4000` (atau port yang Anda tentukan di `.env`).

## Struktur Direktori

Berikut adalah struktur folder standar Lapeh Framework:

```
my-app/
├── bin/                  # Script CLI untuk npx
├── doc/                  # Dokumentasi proyek
├── prisma/               # Konfigurasi Database & Schema
│   ├── migrations/       # File history migrasi database
│   ├── base.prisma.template # Template konfigurasi database
│   ├── schema.prisma     # File schema gabungan (Auto-generated)
│   └── seed.ts           # Script untuk mengisi data awal
├── scripts/              # Script utility (Generator, Compiler)
├── src/                  # Source code utama aplikasi
│   ├── controllers/      # Logika bisnis (Handler request)
│   ├── core/             # Konfigurasi inti (DB, Redis, Server)
│   ├── middleware/       # Middleware Express (Auth, RateLimit)
│   ├── models/           # Definisi Schema Prisma per-fitur
│   ├── routes/           # Definisi routing API
│   ├── utils/            # Helper function (Response, Validator)
│   └── index.ts          # Entry point aplikasi
├── .env                  # Variabel lingkungan (Rahasia)
├── package.json          # Dependensi & Script NPM
└── tsconfig.json         # Konfigurasi TypeScript
```

## Konfigurasi Environment (.env)

File `.env` menyimpan konfigurasi penting. Berikut adalah variabel kunci:

```ini
# Server
PORT=4000
NODE_ENV=development

# Database (Ganti sesuai kredensial Anda)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Security
JWT_SECRET="rahasia-super-panjang-dan-acak"
ACCESS_TOKEN_EXPIRES_IN=3600 # 1 jam

# Redis (Opsional - otomatis mock jika tidak ada)
REDIS_URL="redis://localhost:6379"
NO_REDIS=false # Set true untuk memaksa mode mock
```

## Langkah Selanjutnya

- Pelajari cara menggunakan **[CLI Tools](CLI.md)** untuk mempercepat development.
- Pahami **[Fitur & Konsep Inti](FEATURES.md)** framework.
- Ikuti **[Tutorial Studi Kasus](TUTORIAL.md)** untuk membangun fitur nyata.
