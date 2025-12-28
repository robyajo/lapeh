# Bedah Struktur Proyek

Untuk memahami Lapeh Framework sepenuhnya, Anda perlu tahu apa fungsi setiap file dan folder. Berikut adalah "Tour" lengkap ke dalam direktori proyek.

## Root Directory

| File/Folder          | Deskripsi                                                                     |
| :------------------- | :---------------------------------------------------------------------------- |
| `bin/`               | Berisi script eksekusi untuk CLI (`npx lapeh`). Anda jarang menyentuh ini.    |
| `doc/`               | Dokumentasi proyek ini berada.                                                |
| `lib/`               | **Framework Core**. Bagian internal framework yang jarang Anda sentuh.        |
| `prisma/`            | Jantung konfigurasi Database.                                                 |
| `scripts/`           | Kumpulan script Node.js untuk utility (generator, compiler schema, dll).      |
| `src/`               | **Source Code Utama**. 99% kodingan Anda ada di sini.                         |
| `.env`               | Variabel rahasia (Database URL, API Keys). **Jangan commit file ini ke Git!** |
| `docker-compose.yml` | Konfigurasi Docker untuk menjalankan Database & Redis lokal.                  |
| `nodemon.json`       | Konfigurasi auto-restart saat development.                                    |
| `package.json`       | Daftar library (dependencies) dan perintah (`npm run ...`).                   |
| `tsconfig.json`      | Konfigurasi TypeScript.                                                       |

## Folder `src/` (Source Code - User Space)

Ini adalah tempat Anda bekerja setiap hari.

### `src/modules/` (Modular Architecture)

Lapeh menggunakan pendekatan **Modular**. Setiap fitur dikelompokkan dalam satu folder modul agar kode lebih terorganisir.

Contoh struktur modul `Auth`:

- `Auth/auth.controller.ts`: Logika aplikasi (Controller).
- `Auth/auth.prisma`: Definisi tabel database (Model).

### `src/routes/`

Mendefinisikan URL endpoint.

- Menghubungkan URL (misal `/api/login`) ke fungsi di Controller.
- Menempelkan Middleware (misal `requireAuth`).

### `src/config/`

Konfigurasi aplikasi yang bersifat statis.

- `app.ts`: Konfigurasi umum aplikasi.
- `cors.ts`: Konfigurasi CORS (Cross-Origin Resource Sharing).

## Folder `lib/` (Framework Internals)

Bagian ini mirip dengan `node_modules` atau folder `.next` di Next.js. Ini adalah mesin framework.

### `lib/core/`

Bagian "Mesin" framework.

- `server.ts`: Setup Express App.
- `database.ts`: Instance Prisma Client.
- `redis.ts`: Koneksi Redis.
- `serializer.ts`: Logic caching JSON Schema.

### `lib/middleware/`

Middleware bawaan framework.

- `auth.ts`: Cek JWT Token.
- `rateLimit.ts`: Batasi jumlah request.
- `requestLogger.ts`: Log setiap request yang masuk.

### `lib/utils/`

Fungsi bantuan (Helper) bawaan.

- `validator.ts`: Validasi input yang kuat dan ekspresif.
- `response.ts`: Standar format JSON response (`sendFastSuccess`, `sendError`).
- `logger.ts`: Sistem logging (Winston).

## Folder `prisma/`

- `migrations/`: History perubahan database (SQL file). Jangan diedit manual.
- `base.prisma.template`: Header dari schema database (berisi konfigurasi datasource db).
- `seed.ts`: Script untuk mengisi data awal (Data Seeding).

## Folder `scripts/`

Script-script "Magic" yang dijalankan `npm run`.

- `make-module.js`: Generator modul baru (Controller + Prisma Model).
- `compile-schema.js`: Penggabung file `.prisma` dari setiap modul menjadi satu `schema.prisma`.
- `init-project.js`: Wizard setup awal.
- `generate-jwt-secret.js`: Generator kunci rahasia JWT otomatis.

---

Dengan memahami struktur ini, Anda tidak akan tersesat saat ingin menambah fitur baru atau mencari bug.
