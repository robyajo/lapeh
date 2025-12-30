# Getting Started with Lapeh Framework

Selamat datang di dokumentasi resmi **Lapeh Framework**. Panduan ini akan membantu Anda memulai instalasi, konfigurasi, dan pemahaman dasar tentang struktur proyek.

## Persyaratan Sistem

Sebelum memulai, pastikan sistem Anda memenuhi persyaratan berikut:

- **Node.js**: Versi 18.x atau lebih baru.
- **Package Manager**: NPM (bawaan Node.js).

## Instalasi

Cara termudah untuk memulai adalah menggunakan CLI generator `npx`.

### 1. Buat Project Baru

Jalankan perintah berikut di terminal Anda:

```bash
npx lapeh@latest nama-project-anda
```

Atau untuk setup lengkap (dengan data dummy user & role):

```bash
npx lapeh@latest nama-project-anda --full
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
├── scripts/              # Script utility (Generator, Compiler)
├── src/                  # Source code utama aplikasi
│   ├── controllers/      # Logika bisnis (Handler request)
│   ├── core/             # Konfigurasi inti (DB, Redis, Server)
│   ├── middleware/       # Middleware Express (Auth, RateLimit)
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
