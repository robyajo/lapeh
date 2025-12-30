# Memulai (Getting Started)

Selamat datang di dokumentasi Lapeh Framework! Panduan ini akan membantu Anda memulai proyek baru menggunakan Lapeh.

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- [npm](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)

## Instalasi & Pembuatan Proyek

Anda dapat membuat proyek Lapeh baru dengan menjalankan perintah berikut di terminal Anda:

```bash
npx lapeh-cli@latest create my-app
```

Ikuti petunjuk di terminal untuk mengonfigurasi proyek Anda.

## Menjalankan Proyek

Setelah proyek dibuat, masuk ke direktori proyek dan jalankan server pengembangan:

```bash
cd my-app
npm run dev
```

Server akan berjalan di `http://localhost:3000` (atau port yang Anda konfigurasi).

## Pengujian Login (Default Credentials)

Untuk memudahkan pengembangan dan pengujian awal, proyek ini menyertakan data pengguna default di `database.json`. Anda dapat menggunakan kredensial berikut untuk menguji endpoint login:

- **Email**: `sa@sa.com`
- **Password**: `password`

Endpoint login biasanya tersedia di:
`POST /api/v1/auth/login`

Gunakan kredensial ini untuk mendapatkan Access Token dan mulai menjelajahi API.

## Struktur Proyek

Berikut adalah gambaran singkat struktur proyek Lapeh:

- `src/modules`: Berisi logika bisnis (Controllers, Services).
- `src/routes`: Definisi rute API.
- `lib/core`: Komponen inti framework.
- `database.json`: Penyimpanan data sementara (JSON-based).

Selamat berkarya dengan Lapeh!
