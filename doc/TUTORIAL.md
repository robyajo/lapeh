# Tutorial: Membangun API Perpustakaan

Dalam tutorial ini, kita akan membangun fitur "Manajemen Buku" sederhana menggunakan semua fitur unggulan Lapeh Framework:
1.  **CLI** untuk generate kode.
2.  **Validator** untuk validasi input.
3.  **Fast Serialization** untuk respon cepat.
4.  **RBAC** untuk proteksi delete (Admin only).

## Langkah 1: Generate Model Database

Kita butuh tabel `books`. Gunakan CLI `make:model`.

```bash
npm run make:model Book
```

File baru akan muncul di `src/models/book.prisma`. Edit file tersebut:

```prisma
// src/models/book.prisma

model Book {
  id          BigInt   @id @default(autoincrement())
  title       String
  author      String
  isbn        String   @unique
  publishedAt DateTime
  stock       Int      @default(0)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@map("books")
}
```

Terapkan perubahan ke database:

```bash
npm run prisma:migrate
```

## Langkah 2: Generate Module (Controller & Route)

Kita buat controller dan route sekaligus.

```bash
npm run make:module Book
```

Framework akan membuat:
- `src/controllers/bookController.ts`
- `src/routes/book.ts`

## Langkah 3: Implementasi Controller

Buka `src/controllers/bookController.ts` dan kita implementasikan fitur **Create** dan **List** dengan standar framework.

### Setup Import & Serializer

```typescript
import { Request, Response } from "express";
import { prisma } from "@/core/database";
import { sendFastSuccess, sendError } from "@/utils/response";
import { Validator } from "@/utils/validator";
import { getSerializer, createResponseSchema } from "@/core/serializer";

// 1. Definisikan Schema Output (untuk Fastify Serialization)
const bookSchema = {
  type: "object",
  properties: {
    id: { type: "string" }, // BigInt -> String
    title: { type: "string" },
    author: { type: "string" },
    isbn: { type: "string" },
    stock: { type: "number" }
  }
};

// 2. Buat Serializer
const bookDetailSerializer = getSerializer("book-detail", createResponseSchema(bookSchema));
const bookListSerializer = getSerializer("book-list", createResponseSchema({
  type: "array",
  items: bookSchema
}));
```

### Implementasi Create (dengan Validasi)

```typescript
export async function createBook(req: Request, res: Response) {
  // 1. Validasi Input
  const validator = await Validator.make(req.body, {
    title: "required|string|min:3",
    author: "required|string",
    isbn: "required|string|unique:books,isbn", // Cek unik di tabel books
    stock: "required|number|min:1",
    publishedAt: "required|string" // Format tanggal ISO
  });

  if (validator.fails()) {
    return sendError(res, 400, "Validation Error", validator.errors());
  }

  const data = validator.validated();

  // 2. Simpan ke Database
  const book = await prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      stock: data.stock,
      publishedAt: new Date(data.publishedAt)
    }
  });

  // 3. Return Response Cepat
  return sendFastSuccess(res, 201, bookDetailSerializer, {
    status: "success",
    message: "Buku berhasil ditambahkan",
    data: { ...book, id: book.id.toString() } // Konversi BigInt manual jika perlu
  });
}
```

### Implementasi List (High Performance)

```typescript
export async function getBooks(req: Request, res: Response) {
  const books = await prisma.book.findMany({
    take: 50, // Limit 50
    orderBy: { created_at: "desc" }
  });

  // Convert BigInt to string sebelum passing ke serializer (opsional, tapi aman)
  const safeBooks = books.map(b => ({ ...b, id: b.id.toString() }));

  return sendFastSuccess(res, 200, bookListSerializer, {
    status: "success",
    message: "Daftar buku",
    data: safeBooks
  });
}
```

## Langkah 4: Daftarkan Route & Proteksi

Buka `src/routes/book.ts` (atau file yang digenerate). Pastikan route terhubung dan tambahkan middleware auth.

```typescript
import { Router } from "express";
import { createBook, getBooks } from "../controllers/bookController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const bookRouter = Router();

// Public route (bisa diakses siapa saja)
bookRouter.get("/", getBooks);

// Admin only (Butuh login + role admin)
bookRouter.post("/", requireAuth, requireAdmin, createBook);
```

Terakhir, daftarkan router ini di `src/routes/index.ts` (jika belum otomatis):

```typescript
import { bookRouter } from "./book";
// ...
router.use("/books", bookRouter);
```

## Langkah 5: Testing

Jalankan server:
```bash
npm run dev
```

Coba hit endpoint:
1. **POST /api/books** (Tanpa token) -> 401 Unauthorized.
2. **POST /api/books** (Token User Biasa) -> 403 Forbidden.
3. **POST /api/books** (Token Admin + Data Invalid) -> 400 Validation Error.
4. **POST /api/books** (Token Admin + Data Valid) -> 201 Created.
5. **GET /api/books** -> 200 OK (Super Cepat).

## Kesimpulan

Dengan Lapeh Framework, Anda telah membuat API yang:
- **Aman** (Validasi, Auth, RBAC).
- **Cepat** (Fast Serialization).
- **Rapi** (Struktur terstandarisasi).
- **Mudah** (CLI Generator).
