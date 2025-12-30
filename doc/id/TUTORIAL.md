# Tutorial: Membangun API Perpustakaan

Dalam tutorial ini, kita akan membangun fitur "Manajemen Buku" sederhana menggunakan semua fitur unggulan Lapeh Framework:

1.  **CLI** untuk generate kode.
2.  **Validator** untuk validasi input.
3.  **Fast Serialization** untuk respon cepat.

> **Catatan**: Tutorial ini menggunakan array in-memory untuk penyimpanan data agar tetap sederhana. Lapeh v3.0.0 bersifat database-agnostic, jadi Anda bebas menggantinya dengan Prisma, TypeORM, atau library database lainnya.

## Langkah 1: Generate Module (Controller & Route)

Kita akan membuat controller dan route untuk fitur Buku.

```bash
npm run make:module Book
```

Framework akan membuat:

- `src/controllers/bookController.ts`
- `src/routes/book.ts`

## Langkah 2: Implementasi Controller

Buka `src/controllers/bookController.ts` dan kita implementasikan fitur **Create** dan **List**.

### Setup Import & Data Store

```typescript
import { Request, Response } from "express";
import { sendFastSuccess, sendError } from "@/utils/response";
import { Validator } from "@/utils/validator";
import { getSerializer, createResponseSchema } from "@/core/serializer";

// Simpan data di memory (Array sederhana)
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  stock: number;
}
const books: Book[] = [];

// 1. Definisikan Schema Output (untuk Fastify Serialization)
const bookSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    author: { type: "string" },
    isbn: { type: "string" },
    stock: { type: "number" },
  },
};

// 2. Buat Serializer
const bookDetailSerializer = getSerializer(
  "book-detail",
  createResponseSchema(bookSchema)
);
const bookListSerializer = getSerializer(
  "book-list",
  createResponseSchema({
    type: "array",
    items: bookSchema,
  })
);
```

### Implementasi Create (dengan Validasi)

```typescript
export async function createBook(req: Request, res: Response) {
  // 1. Validasi Input
  const validator = await Validator.make(req.body, {
    title: "required|string|min:3",
    author: "required|string",
    isbn: "required|string",
    stock: "required|number|min:1",
  });

  if (validator.fails()) {
    return sendError(res, 400, "Validation Error", validator.errors());
  }

  // 2. Simpan Data (In-Memory)
  const newBook: Book = {
    id: Date.now().toString(),
    ...validator.validated(),
  };
  books.push(newBook);

  // 3. Kirim Response (Serialized)
  return sendFastSuccess(res, bookDetailSerializer(newBook), 201);
}

export async function listBooks(req: Request, res: Response) {
  // Return semua buku
  return sendFastSuccess(res, bookListSerializer(books));
}
```

## Langkah 3: Register Route

Buka `src/routes/book.ts`. CLI sudah membuat struktur dasarnya. Kita hanya perlu menghubungkannya dengan fungsi controller kita.

```typescript
import { Router } from "express";
import { createBook, listBooks } from "../controllers/bookController";

const router = Router();

router.post("/", createBook);
router.get("/", listBooks);

export default router;
```

## Langkah 4: Test API Anda

Jalankan server:

```bash
npm run dev
```

Test dengan curl atau Postman:

**Buat Buku Baru:**

```bash
curl -X POST http://localhost:8000/api/book \
  -H "Content-Type: application/json" \
  -d '{"title":"Panduan Lapeh", "author":"Tim Lapeh", "isbn":"12345", "stock":10}'
```

**List Buku:**

```bash
curl http://localhost:8000/api/book
```

Selamat! Anda telah membangun API yang cepat dan tervalidasi tanpa terjebak dalam konfigurasi database yang rumit.
