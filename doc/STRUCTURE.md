# Bedah Struktur Proyek

Untuk memahami Lapeh Framework sepenuhnya, Anda perlu tahu apa fungsi setiap file dan folder. Berikut adalah "Tour" lengkap ke dalam direktori proyek.

## Root Directory

| File/Folder | Deskripsi |
| :--- | :--- |
| `bin/` | Berisi script eksekusi untuk CLI (`npx lapeh`). Anda jarang menyentuh ini. |
| `doc/` | Dokumentasi proyek ini berada. |
| `prisma/` | Jantung konfigurasi Database. |
| `scripts/` | Kumpulan script Node.js untuk utility (generator, compiler schema, dll). |
| `src/` | **Source Code Utama**. 99% kodingan Anda ada di sini. |
| `.env` | Variabel rahasia (Database URL, API Keys). **Jangan commit file ini ke Git!** |
| `docker-compose.yml` | Konfigurasi Docker untuk menjalankan Database & Redis lokal. |
| `nodemon.json` | Konfigurasi auto-restart saat development. |
| `package.json` | Daftar library (dependencies) dan perintah (`npm run ...`). |
| `tsconfig.json` | Konfigurasi TypeScript. |

## Folder `src/` (Source Code)

Ini adalah tempat Anda bekerja setiap hari.

### `src/controllers/`
Berisi logika aplikasi. Controller menerima Request, memprosesnya, dan mengembalikan Response.
- **Contoh**: `authController.ts` menangani login/register.
- **Tips**: Jangan taruh *business logic* yang terlalu kompleks di sini. Gunakan Service (opsional) jika controller sudah terlalu gemuk.

### `src/models/`
Berisi definisi tabel database (Schema Prisma).
- **Unik di Lapeh**: Kami memecah `schema.prisma` yang besar menjadi file-file kecil per fitur (misal `user.prisma`, `product.prisma`) agar mudah di-manage. Script `prisma:migrate` akan menggabungkannya nanti.

### `src/routes/`
Mendefinisikan URL endpoint.
- Menghubungkan URL (misal `/api/login`) ke fungsi di Controller.
- Menempelkan Middleware (misal `requireAuth`).

### `src/middleware/`
Kode yang berjalan *sebelum* Controller.
- `auth.ts`: Cek JWT Token.
- `rateLimit.ts`: Batasi jumlah request.
- `requestLogger.ts`: Log setiap request yang masuk.

### `src/utils/`
Fungsi bantuan (Helper) yang bisa dipakai di mana saja.
- `validator.ts`: Validasi input ala Laravel.
- `response.ts`: Standar format JSON response (`sendSuccess`, `sendError`).
- `logger.ts`: Sistem logging (Winston).

### `src/core/`
Bagian "Mesin" framework. Anda jarang perlu mengubah ini kecuali ingin memodifikasi behavior dasar framework.
- `server.ts`: Setup Express App.
- `database.ts`: Instance Prisma Client.
- `redis.ts`: Koneksi Redis.
- `serializer.ts`: Logic caching JSON Schema.

## Folder `prisma/`

- `migrations/`: History perubahan database (SQL file). Jangan diedit manual.
- `base.prisma.template`: Header dari schema database (berisi konfigurasi datasource db).
- `seed.ts`: Script untuk mengisi data awal (Data Seeding).

## Folder `scripts/`

Script-script "Magic" yang dijalankan `npm run`.
- `make-controller.js`: Generator controller.
- `compile-schema.js`: Penggabung file `.prisma`.
- `init-project.js`: Wizard setup awal.

---

Dengan memahami struktur ini, Anda tidak akan tersesat saat ingin menambah fitur baru atau mencari bug.
