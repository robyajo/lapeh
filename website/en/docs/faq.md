# Frequently Asked Questions (FAQ)

Kumpulan pertanyaan umum dan solusi untuk masalah yang sering dihadapi.

## Database

### Q: Database apa yang didukung?

**A:**
Lapeh bersifat **Database Agnostic**. Anda bisa menggunakan PostgreSQL, MySQL, MongoDB, atau database apapun. Framework tidak membatasi pilihan database Anda. Kami menyediakan wrapper `db` generik yang bisa Anda konfigurasi sesuai kebutuhan.

## Redis & Caching

### Q: Saya tidak ingin pakai Redis di local, ribet installnya.

**A:**
Tenang, Lapeh otomatis mendeteksi jika Redis tidak berjalan dan akan menggunakan **In-Memory Mock** (simulasi Redis di RAM). Aplikasi tetap jalan normal tanpa error. Anda tidak perlu config apa-apa.

### Q: Bagaimana cara clear cache Redis?

**A:**
Jika punya akses CLI Redis: `redis-cli FLUSHALL`.
Atau via kode:

```typescript
import { redis } from "@/core/redis";
await redis.flushall();
```

## Fitur & Kustomisasi

### Q: Bagaimana cara handle File Upload?

**A:**
Gunakan `multer`. Framework sudah menyiapkannya di `src/routes/auth.ts` sebagai contoh (upload avatar).
Anda bisa copy logic konfigurasi `multer` tersebut ke route lain.

### Q: Bagaimana cara menambah middleware global baru?

**A:**
Buka `src/core/server.ts`. Di sana ada bagian `// Global Middlewares`. Tambahkan middleware Express Anda di situ:

```typescript
app.use(myCustomMiddleware);
```

### Q: Saya ingin mengubah port server.

**A:**
Cukup ubah variabel `PORT` di file `.env`. Defaultnya adalah `8000`.

## Troubleshooting

### Q: Error `EADDRINUSE: address already in use :::8000`

**A:**
Artinya port 8000 sedang dipakai program lain (atau instance Lapeh sebelumnya yang nyangkut).
**Solusi:**

1. Matikan terminal.
2. Jalankan perintah kill (framework biasanya memberi saran commandnya saat error muncul).
   - Windows: `taskkill /F /IM node.exe` (Hati-hati ini mematikan semua node process).
   - Atau cari PID nya: `netstat -ano | findstr :8000`.

### Q: Error `Unique constraint failed` saat seeding

**A:**
Data yang mau dimasukkan sudah ada (misal email `sa@sa.com`).
Jalankan `npm run db:reset` untuk menghapus semua data dan mulai dari nol.
