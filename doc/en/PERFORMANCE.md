# Panduan Performa & Skalabilitas Lapeh Framework

Dokumen ini menjelaskan cara memaksimalkan performa aplikasi Lapeh Anda menggunakan fitur-fitur canggih seperti Fast-Serialization dan Clustering.

## 1. High Performance Serialization (Fastify-Style)

Express secara default menggunakan `JSON.stringify()` yang lambat karena harus memeriksa tipe data setiap field secara runtime. Lapeh mengadopsi teknik **Schema Based Serialization** (seperti Fastify) yang bisa meningkatkan throughput JSON hingga **2x-3x lipat**.

### Cara Penggunaan

Gunakan `sendFastSuccess` di controller Anda untuk endpoint yang membutuhkan performa tinggi (misalnya: list data yang besar).

```typescript
import { Request, Response } from "express";
import { getSerializer, createResponseSchema } from "../core/serializer";
import { sendFastSuccess } from "../utils/response";

// 1. Definisikan Schema Output (JSON Schema Standard)
const userSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    email: { type: "string" },
    // Password tidak dimasukkan, jadi otomatis tidak akan terkirim (aman!)
  }
};

// 2. Compile Serializer (Otomatis dicache oleh framework)
const userListSerializer = getSerializer("user-list", createResponseSchema({
  type: "array",
  items: userSchema
}));

export async function getUsers(req: Request, res: Response) {
  // Contoh pengambilan data dari database
  const users = await db.users.findMany();

  // 3. Kirim response super cepat
  return sendFastSuccess(res, 200, userListSerializer, {
    status: "success",
    message: "Data fetched",
    data: users
  });
}
```

---

## 2. Horizontal Scaling (Load Balancer & Cluster)

Lapeh dirancang untuk siap di-scale secara horizontal (menambah jumlah server, bukan memperbesar spesifikasi server).

### Arsitektur Cluster
- **Nginx**: Bertindak sebagai Load Balancer yang membagi trafik ke server-server aplikasi.
- **Redis**: Menyimpan Session, Rate Limit, dan Cache agar bisa diakses oleh semua server (Shared State).
- **App Instances**: Beberapa instance aplikasi Lapeh yang berjalan paralel.

### Cara Menjalankan Cluster (Docker)

Kami telah menyediakan konfigurasi siap pakai di `docker-compose.cluster.yml`.

1. **Build & Run Cluster**:
   ```bash
   docker-compose -f docker-compose.cluster.yml up --build
   ```

2. **Akses Aplikasi**:
   Buka `http://localhost:8080`.
   Nginx akan otomatis membagi request Anda ke `app-1` atau `app-2`.

3. **Cek Status**:
   ```bash
   docker-compose -f docker-compose.cluster.yml ps
   ```

### Konfigurasi Rate Limiter Terdistribusi
Middleware `src/middleware/rateLimit.ts` telah diupdate untuk menggunakan Redis Store.
Ini artinya jika User A terkena limit di Server 1, dia juga akan terblokir di Server 2.

```typescript
// src/middleware/rateLimit.ts
store: redis ? new RedisStore({ sendCommand: ... }) : undefined
```

---

## 3. Tips Optimasi Lainnya

- **Gunakan `.lean()` / Select**: Saat query database, selalu pilih field yang dibutuhkan saja.
- **Compression**: Aktifkan gzip/brotli di Nginx (sudah ada di config default Nginx umumnya).
- **Keep-Alive**: Gunakan koneksi database yang persistent (sudah dihandle oleh Prisma).
