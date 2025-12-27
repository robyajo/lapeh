# Fitur & Konsep Inti

Dokumen ini menjelaskan fitur-fitur utama Lapeh Framework dan cara penggunaannya secara mendalam.

## 1. Validasi Data (Laravel-Style)

Framework ini menyediakan utility `Validator` yang terinspirasi dari Laravel, menggunakan `zod` di belakang layar namun dengan API yang lebih string-based dan mudah dibaca.

**Lokasi:** `@/utils/validator`

### Penggunaan Dasar

```typescript
import { Validator } from "@/utils/validator";

export async function createProduct(req: Request, res: Response) {
  const validator = await Validator.make(req.body, {
    name: "required|string|min:3",
    price: "required|number|min:1000",
    email: "required|email|unique:user,email", // Cek unik di tabel user kolom email
    category_id: "required|exists:category,id", // Cek exist di tabel category kolom id
    photo: "required|image|max:2048", // Validasi file upload (Max 2MB)
  });

  if (validator.fails()) {
    return sendError(res, 400, "Validation failed", validator.errors());
  }

  const data = validator.validated();
  // Lanjut proses simpan...
}
```

### Aturan Tersedia (Rules)

- `required`: Wajib diisi.
- `string`, `number`, `boolean`: Tipe data.
- `email`: Format email valid.
- `min:X`, `max:X`: Panjang string atau nilai number.
- `unique:table,column`: Pastikan nilai belum ada di database (Async).
- `exists:table,column`: Pastikan nilai ada di database (Async).
- `image`: File harus berupa gambar (jpg, png, webp, dll).
- `mimes:types`: File harus tipe tertentu (misal: `mimes:pdf,docx`).

## 2. High Performance Response (Fastify-Style)

Untuk endpoint yang membutuhkan performa tinggi (misalnya list data besar), gunakan serialisasi berbasis schema. Ini jauh lebih cepat daripada `res.json` standar Express.

**Lokasi:** `@/utils/response`, `@/core/serializer`

### Langkah Implementasi

1. **Definisikan Schema Output**
   Sesuaikan dengan field yang ingin ditampilkan ke user.

   ```typescript
   const productSchema = {
     type: "object",
     properties: {
       id: { type: "string" }, // BigInt otomatis jadi string
       name: { type: "string" },
       price: { type: "number" },
     },
   };
   ```

2. **Buat Serializer (Cached)**
   Simpan di luar handler function agar dicompile sekali saja.

   ```typescript
   import { getSerializer, createResponseSchema } from "@/core/serializer";

   const productSerializer = getSerializer(
     "product-single",
     createResponseSchema(productSchema)
   );
   ```

3. **Kirim Response**

   ```typescript
   import { sendFastSuccess } from "@/utils/response";

   // Di dalam controller
   sendFastSuccess(res, 200, productSerializer, {
     status: "success",
     message: "Data retrieved",
     data: productData,
   });
   ```

## 3. Authentication & Authorization (RBAC)

Sistem autentikasi menggunakan JWT (JSON Web Token) dan mendukung Role-Based Access Control.

### Middleware Auth

- `requireAuth`: Memastikan user login (mengirim header `Authorization: Bearer <token>`).
- `requireAdmin`: Memastikan user login DAN memiliki role `admin` atau `super_admin`.

**Contoh di Route:**

```typescript
import { requireAuth, requireAdmin } from "@/middleware/auth";

router.get("/profile", requireAuth, getProfile); // Login only
router.delete("/users/:id", requireAuth, requireAdmin, deleteUser); // Admin only
```

### Helper RBAC (Role Based Access Control)

Anda bisa mengecek permission secara granular di dalam controller:

```typescript
// (Contoh implementasi, logic ada di AuthController/RbacController)
if (req.user.role !== "manager") {
  return sendError(res, 403, "Forbidden");
}
```

## 4. Caching & Redis

Framework ini memiliki integrasi Redis "Zero-Config".

- Jika `REDIS_URL` ada di `.env` dan server Redis berjalan, framework akan connect.
- Jika tidak ada atau gagal connect, framework otomatis fallback ke **In-Memory Mock**. Ini membuat development di local tidak wajib install Redis.

**Mengakses Redis:**

```typescript
import { redis } from "@/core/redis";

// Set cache (1 jam)
await redis.set("my-key", "value", "EX", 3600);

// Get cache
const val = await redis.get("my-key");
```

## 5. Keamanan (Security)

Secara default, framework sudah menerapkan:

- **Helmet**: Mengamankan HTTP headers.
- **CORS**: Mengizinkan akses lintas domain (configurable).
- **Rate Limiting**: Membatasi jumlah request per IP untuk mencegah DDoS/Brute Force.
  - Konfigurasi ada di `src/middleware/rateLimit.ts`.
  - Default: 100 request / 15 menit.

## 6. Import Path Aliases

Gunakan `@/` untuk import module agar kode lebih bersih.

- `@/core` -> `src/core`
- `@/controllers` -> `src/controllers`
- `@/utils` -> `src/utils`
- `@/middleware` -> `src/middleware`

**Contoh:**

```typescript
import { prisma } from "@/core/database"; // ✅ Rapi
// vs
import { prisma } from "../../../core/database"; // ❌ Berantakan
```
